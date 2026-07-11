import {
    pinToTop,
    setTargetSpotlightOverlayElementId,
    setTargetSpotlightOverlayPlacement,
} from "@/components/target-spotlight-overlay";
import { events, listenAppEvent, type AppEventName, type AppEventPayloadMap } from "@/services/events";
import { saveTutorialProgress, type TutorialStatus } from "@/services/tutorials";
import { clearSpotlightContent, flushSpotlightContent, setSpotlightContentToRender } from "./spotlight-renderer";
import {
    IntervalSupersededError,
    type IntervalBreakOptions,
    type IntervalContext,
    type StepContext,
    type StoredStepData,
    type TutorialStepsIdentity,
} from "./types";

const DEFAULT_UNTIL_READY_TIMEOUT_MS = 5_000;

function delay(delayMs: number, onceCleanups: Set<() => void>): Promise<void> {
    return new Promise<void>((resolve) => {
        const cleanupDelayForThis = (): void => {
            window.clearTimeout(timeoutId);
            onceCleanups.delete(cleanupDelayForThis);
        };

        const timeoutId = window.setTimeout(() => {
            cleanupDelayForThis();
            resolve();
        }, delayMs);

        onceCleanups.add(cleanupDelayForThis);
    });
}

function createIntervalBreakPromise(
    intervalMs: number,
    tick: (breakInterval: () => void) => void,
    options: IntervalBreakOptions | undefined,
    cleanups: Set<() => void>,
): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        let broken = false;
        let aborted = false;
        let ready = options?.untilReady == null;
        const untilReadyTimeoutMs =
            options?.untilReadyTimeoutMs ??
            (options?.untilReady != null ? DEFAULT_UNTIL_READY_TIMEOUT_MS : undefined);
        let untilReadyTimeoutId: number | undefined;

        const cleanupIntervalForThis = (): void => {
            window.clearInterval(intervalId);
            if (untilReadyTimeoutId != null) {
                window.clearTimeout(untilReadyTimeoutId);
                untilReadyTimeoutId = undefined;
            }
            cleanups.delete(abortIntervalBreak);
        };

        const breakInterval = (): void => {
            if (broken || aborted) return;
            broken = true;
            cleanupIntervalForThis();
            resolve(true);
        };

        const abortIntervalBreak = (): void => {
            if (broken || aborted) return;
            aborted = true;
            cleanupIntervalForThis();
        };

        if (!ready && untilReadyTimeoutMs != null) {
            untilReadyTimeoutId = window.setTimeout(breakInterval, untilReadyTimeoutMs);
        }

        const intervalId = window.setInterval(() => {
            if (!ready) {
                if (options?.untilReady?.()) {
                    ready = true;
                    if (untilReadyTimeoutId != null) {
                        window.clearTimeout(untilReadyTimeoutId);
                        untilReadyTimeoutId = undefined;
                    }
                }
                return;
            }
            tick(breakInterval);
        }, intervalMs);

        cleanups.add(abortIntervalBreak);
    });
}

function createIntervalTickContext(): { ctx: IntervalContext; supersede: () => void } {
    const tickCleanups = new Set<() => void>();
    let tickRejectPending: ((error: IntervalSupersededError) => void) | null = null;

    const rejectPendingTick = (): void => {
        if (tickRejectPending) {
            const reject = tickRejectPending;
            tickRejectPending = null;
            reject(new IntervalSupersededError());
        }
    };

    const supersede = (): void => {
        for (const cleanup of tickCleanups) {
            cleanup();
        }
        tickCleanups.clear();
        rejectPendingTick();
    };

    const trackPending = <T>(run: (reject: (error: IntervalSupersededError) => void) => Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            tickRejectPending = reject;
            void run(reject).then(
                (value) => {
                    if (tickRejectPending === reject) {
                        tickRejectPending = null;
                    }
                    resolve(value);
                },
                (error: unknown) => {
                    if (tickRejectPending === reject) {
                        tickRejectPending = null;
                    }
                    reject(error);
                },
            );
        });
    };

    const ctx: IntervalContext = {
        once<TEventName extends AppEventName>(eventName: TEventName) {
            return new Promise<AppEventPayloadMap[TEventName]>((resolve, reject) => {
                supersede();
                tickRejectPending = reject;

                const cleanupOnceForThis = (): void => {
                    cleanup();
                    tickCleanups.delete(cleanupOnceForThis);
                    if (tickRejectPending === reject) {
                        tickRejectPending = null;
                    }
                };

                const cleanup = listenAppEvent(eventName, (event) => {
                    cleanupOnceForThis();
                    resolve(event.detail);
                });

                tickCleanups.add(cleanupOnceForThis);
            });
        },

        sleep(delayMs) {
            return trackPending(async () => {
                return new Promise<void>((resolve) => {
                    const cleanupDelayForThis = (): void => {
                        window.clearTimeout(timeoutId);
                        tickCleanups.delete(cleanupDelayForThis);
                    };

                    const timeoutId = window.setTimeout(() => {
                        cleanupDelayForThis();
                        resolve();
                    }, delayMs);

                    tickCleanups.add(cleanupDelayForThis);
                });
            });
        },

        timeout(delayMs) {
            return ctx.sleep(delayMs);
        },

        race<T extends readonly [...unknown[]]>(...promises: { [K in keyof T]: Promise<T[K]> }) {
            return trackPending(async () => {
                return new Promise<{ [K in keyof T]: T[K] | undefined }>((resolve) => {
                    let settled = false;
                    const results: unknown[] = new Array<unknown>(promises.length);

                    const settle = (index: number, value: unknown): void => {
                        if (settled) return;
                        settled = true;
                        for (const cleanup of tickCleanups) {
                            cleanup();
                        }
                        tickCleanups.clear();
                        results[index] = value;
                        resolve(results as { [K in keyof T]: T[K] | undefined });
                    };

                    promises.forEach((promise, index) => {
                        void Promise.resolve(promise).then((value) => {
                            settle(index, value);
                        });
                    });
                });
            });
        },

        intervalBreak(intervalMs, tick, options) {
            return trackPending(async () => {
                return createIntervalBreakPromise(intervalMs, tick, options, tickCleanups);
            });
        },
    };

    return { ctx, supersede };
}

export function createIntervalTickStepContext<TData extends StoredStepData>(
    base: StepContext<TData>,
    intervalCtx: IntervalContext,
    onStepDone: () => void,
): StepContext<TData> {
    const wrapDone =
        <TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<void>) =>
        async (...args: TArgs): Promise<void> => {
            await fn(...args);
            onStepDone();
        };

    return {
        ...base,
        once: intervalCtx.once,
        sleep: intervalCtx.sleep,
        timeout: intervalCtx.timeout,
        race: intervalCtx.race,
        intervalBreak: intervalCtx.intervalBreak,
        next: wrapDone(base.next),
        goTo: wrapDone(base.goTo),
        markIdle: wrapDone(base.markIdle),
        markPendingAction: wrapDone(base.markPendingAction),
        markInterrupted: wrapDone(base.markInterrupted),
        markCompleted: wrapDone(base.markCompleted),
    };
}

type CreateStepContextOptions<TData extends StoredStepData> = {
    identity: TutorialStepsIdentity;
    stepIds: readonly string[];
    getState: () => TData;
    setState: (next: TData) => void;
    runStepById: (stepId: string) => Promise<void>;
};

export type ManagedStepContext<TData extends StoredStepData> = StepContext<TData> & {
    dispose: () => void;
    cleanupSubscriptions: () => void;
};

export function runIntervalWrappedStepHandler<TData extends StoredStepData>(
    ctx: ManagedStepContext<TData>,
    intervalMs: number,
    handler: (ctx: StepContext<TData>, tickNumber: number) => Promise<void>,
): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let tickNumber = 0;

        const onStepDone = (): void => {
            if (settled) return;
            settled = true;
            resolve();
        };

        ctx.interval(
            intervalMs,
            async (intervalCtx) => {
                if (settled) return;

                tickNumber += 1;
                const tickCtx = createIntervalTickStepContext(ctx, intervalCtx, onStepDone);

                try {
                    await handler(tickCtx, tickNumber);
                } catch (error) {
                    if (error instanceof IntervalSupersededError) return;
                    if (!settled) {
                        settled = true;
                        reject(error);
                    }
                }
            },
            { immediate: true },
        );
    });
}

export function createStepContext<TData extends StoredStepData>(
    options: CreateStepContextOptions<TData>,
): ManagedStepContext<TData> {
    const onceCleanups = new Set<() => void>();
    const intervalCleanups = new Set<() => void>();
    let hasSpotlightContent = false;
    let disposed = false;

    const cleanupOnce = (): void => {
        for (const cleanup of onceCleanups) {
            cleanup();
        }
        onceCleanups.clear();
    };

    const cleanupIntervals = (): void => {
        for (const cleanup of intervalCleanups) {
            cleanup();
        }
        intervalCleanups.clear();
    };

    const cleanupSpotlight = (): void => {
        clearSpotlightContent();
        hasSpotlightContent = false;
    };

    const cleanupSubscriptions = (): void => {
        cleanupOnce();
        cleanupIntervals();
    };

    const clearSpotlightTarget = (): void => {
        setTargetSpotlightOverlayElementId(null);
    };

    const persistState = async (next: TData): Promise<void> => {
        options.setState(next);
        await saveTutorialProgress(
            options.identity.tutorialGroupId,
            options.identity.tutorialId,
            "pending-action",
            next,
        );
    };

    const finalizeStatus = async (status: TutorialStatus, metadata: TData | null): Promise<void> => {
        disposed = true;
        cleanupSubscriptions();
        cleanupSpotlight();
        clearSpotlightTarget();
        await saveTutorialProgress(
            options.identity.tutorialGroupId,
            options.identity.tutorialId,
            status,
            metadata,
        );
    };

    const mergeState = (partial?: Partial<TData>): TData => ({
        ...options.getState(),
        ...partial,
    });

    const goTo = async (stepId: string, partial?: Partial<Omit<TData, "step">>): Promise<void> => {
        cleanupSubscriptions();
        cleanupSpotlight();
        const next = {
            ...options.getState(),
            ...partial,
            step: stepId,
        } as TData;
        await persistState(next);
        if (disposed) return;
        void options.runStepById(stepId);
    };

    const cleanupStopListener = listenAppEvent(events.TUTORIAL_STOP_BUTTON_CLICKED, () => {
        if (disposed) return;
        void finalizeStatus("interrupted", mergeState());
    });

    const cleanupPrevListener = listenAppEvent(events.TUTORIAL_PREV_BUTTON_CLICKED, () => {
        if (disposed) return;
        const currentIndex = options.stepIds.indexOf(options.getState().step);
        if (currentIndex <= 0) return;
        const previousStepId = options.stepIds[currentIndex - 1];
        if (previousStepId == null) return;
        void goTo(previousStepId);
    });

    const canGoToPreviousStep = () => options.stepIds.indexOf(options.getState().step) > 0;

    const ctx: ManagedStepContext<TData> = {
        setSpotlightContent(content, actions) {
            hasSpotlightContent = true;
            setSpotlightContentToRender(content, actions, {
                showStopButton: true,
                canGoToPreviousStep: canGoToPreviousStep(),
            });
        },

        clearSpotlightContent() {
            cleanupSpotlight();
        },

        pinToTop(pinOptions) {
            pinToTop(pinOptions);
            if (hasSpotlightContent) {
                flushSpotlightContent();
            }
        },

        setSpotlightPlacement(placement) {
            setTargetSpotlightOverlayPlacement(placement);
        },

        once<TEventName extends AppEventName>(eventName: TEventName) {
            return new Promise<AppEventPayloadMap[TEventName]>((resolve) => {
                const cleanupOnceForThis = (): void => {
                    cleanup();
                    onceCleanups.delete(cleanupOnceForThis);
                };

                const cleanup = listenAppEvent(eventName, (event) => {
                    cleanupOnceForThis();
                    resolve(event.detail);
                });

                onceCleanups.add(cleanupOnceForThis);
            });
        },

        timeout(delayMs) {
            return delay(delayMs, onceCleanups);
        },

        sleep(delayMs) {
            return delay(delayMs, onceCleanups);
        },

        race<T extends readonly [...unknown[]]>(...promises: { [K in keyof T]: Promise<T[K]> }) {
            return new Promise<{ [K in keyof T]: T[K] | undefined }>((resolve) => {
                let settled = false;
                const results: unknown[] = new Array<unknown>(promises.length);

                const settle = (index: number, value: unknown): void => {
                    if (settled) return;
                    settled = true;
                    results[index] = value;
                    cleanupSubscriptions();
                    resolve(results as { [K in keyof T]: T[K] | undefined });
                };

                promises.forEach((promise, index) => {
                    void Promise.resolve(promise).then((value) => {
                        settle(index, value);
                    });
                });
            });
        },

        interval(intervalMs, tick, options) {
            let supersedePreviousTick: (() => void) | null = null;

            const runTick = (): void => {
                supersedePreviousTick?.();

                const { ctx, supersede } = createIntervalTickContext();
                supersedePreviousTick = supersede;

                void Promise.resolve(tick(ctx)).catch((error: unknown) => {
                    if (!(error instanceof IntervalSupersededError)) {
                        throw error;
                    }
                });
            };

            if (options?.immediate) {
                runTick();
            }

            const intervalId = window.setInterval(runTick, intervalMs);

            const cleanupIntervalForThis = (): void => {
                supersedePreviousTick?.();
                supersedePreviousTick = null;
                window.clearInterval(intervalId);
                intervalCleanups.delete(cleanupIntervalForThis);
            };

            intervalCleanups.add(cleanupIntervalForThis);
        },

        intervalBreak(intervalMs, tick, options) {
            return createIntervalBreakPromise(intervalMs, tick, options, intervalCleanups);
        },

        async next(partial) {
            const currentIndex = options.stepIds.indexOf(options.getState().step);
            const nextStepId = currentIndex < 0 ? options.stepIds[0] : options.stepIds[currentIndex + 1];
            if (nextStepId == null) return;
            await goTo(nextStepId, partial);
        },

        goTo(stepId, partial) {
            return goTo(stepId, partial);
        },

        getState() {
            return options.getState();
        },

        markIdle() {
            return finalizeStatus("idle", null);
        },

        markPendingAction(partial) {
            return finalizeStatus("pending-action", mergeState(partial));
        },

        markInterrupted(partial) {
            return finalizeStatus("interrupted", mergeState(partial));
        },

        markCompleted(partial) {
            return finalizeStatus("completed", mergeState(partial));
        },

        dispose() {
            disposed = true;
            cleanupStopListener();
            cleanupPrevListener();
            cleanupSubscriptions();
            cleanupSpotlight();
        },

        cleanupSubscriptions,
    };

    return ctx;
}
