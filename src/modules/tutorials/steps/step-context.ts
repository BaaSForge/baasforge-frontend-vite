import { pinToTop, setTargetSpotlightOverlayElementId } from "@/components/target-spotlight-overlay";
import { listenAppEvent } from "@/services/events";
import { saveTutorialProgress } from "@/services/tutorials";
import type { TutorialStatus } from "@/services/tutorials";
import type { AppEventName } from "@/services/events";
import { clearSpotlightContent, flushSpotlightContent, setSpotlightContentToRender } from "./spotlight-renderer";
import type { StepContext, StoredStepData, TutorialStepsIdentity } from "./types";

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
        const next = {
            ...options.getState(),
            ...partial,
            step: stepId,
        } as TData;
        await persistState(next);
        if (disposed) return;
        void options.runStepById(stepId);
    };

    const ctx: ManagedStepContext<TData> = {
        setSpotlightContent(content, actions) {
            hasSpotlightContent = true;
            setSpotlightContentToRender(content, actions);
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

        once(eventName: AppEventName) {
            return new Promise<unknown>((resolve) => {
                const cleanupOnceForThis = (): void => {
                    cleanup();
                    onceCleanups.delete(cleanupOnceForThis);
                };

                const cleanup = listenAppEvent(eventName, (event) => {
                    cleanupOnceForThis();
                    resolve(event instanceof CustomEvent ? event.detail : undefined);
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

        race(...promises: Promise<unknown>[]) {
            return new Promise<unknown[]>((resolve) => {
                let settled = false;
                const results = new Array<unknown>(promises.length);

                const settle = (index: number, value: unknown): void => {
                    if (settled) return;
                    settled = true;
                    results[index] = value;
                    cleanupSubscriptions();
                    resolve(results);
                };

                promises.forEach((promise, index) => {
                    void Promise.resolve(promise).then((value) => {
                        settle(index, value);
                    });
                });
            });
        },

        interval(intervalMs, tick) {
            const intervalId = window.setInterval(tick, intervalMs);

            const cleanupIntervalForThis = (): void => {
                window.clearInterval(intervalId);
                intervalCleanups.delete(cleanupIntervalForThis);
            };

            intervalCleanups.add(cleanupIntervalForThis);
        },

        intervalBreak(intervalMs, tick) {
            return new Promise<boolean>((resolve) => {
                let broken = false;
                let aborted = false;

                const cleanupIntervalForThis = (): void => {
                    window.clearInterval(intervalId);
                    intervalCleanups.delete(abortIntervalBreak);
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

                const intervalId = window.setInterval(() => {
                    tick(breakInterval);
                }, intervalMs);

                intervalCleanups.add(abortIntervalBreak);
            });
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
            cleanupSubscriptions();
            cleanupSpotlight();
        },

        cleanupSubscriptions,
    };

    return ctx;
}
