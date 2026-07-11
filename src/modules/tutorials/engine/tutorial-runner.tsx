"use client";

import {
    pinToTop,
    setTargetSpotlightOverlayElementId,
    setTargetSpotlightOverlayElementSelector,
    SpotlightActions,
    SpotlightContent,
    SpotlightPrevButton,
    SpotlightStopButton,
} from "@/components/target-spotlight-overlay";
import { events, listenAppEvent, type AppEventName } from "@/services/events";
import { getTutorialProgressRecord, saveTutorialProgress, type TutorialStatus } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import type {
    RunnerDisplay,
    RunnerPhase,
    RunnerSnapshot,
    StepTarget,
    TutorialDefinition,
    TutorialRunData,
    TutorialStep,
} from "./types";

const DEFAULT_GRACE_MS = 2_500;
const SAFETY_REVALIDATE_INTERVAL_MS = 1_000;

function isRunData(value: unknown): value is TutorialRunData<Record<string, unknown>> {
    if (value == null || typeof value !== "object") return false;
    const data = value as TutorialRunData<Record<string, unknown>>;
    return (
        Array.isArray(data.completedStepIds) &&
        data.completedStepIds.every((id) => typeof id === "string") &&
        data.extra != null &&
        typeof data.extra === "object"
    );
}

function isTargetPresent(target: StepTarget): boolean {
    if ("elementId" in target) return document.getElementById(target.elementId) != null;
    if ("selector" in target) return document.querySelector(target.selector) != null;
    return true;
}

function isSameTarget(a: StepTarget, b: StepTarget): boolean {
    if ("hidden" in a || "hidden" in b) return "hidden" in a && "hidden" in b;
    if ("elementId" in a && "elementId" in b) return a.elementId === b.elementId && a.placement === b.placement;
    if ("selector" in a && "selector" in b) return a.selector === b.selector && a.placement === b.placement;
    if ("pinToTop" in a && "pinToTop" in b) {
        return a.pinToTop.status === b.pinToTop.status && a.pinToTop.hidePinCircles === b.pinToTop.hidePinCircles;
    }
    return false;
}

function isSameDisplay<TExtra extends Record<string, unknown>>(
    a: RunnerDisplay<TExtra>,
    b: RunnerDisplay<TExtra>,
): boolean {
    if (a.kind !== b.kind) return false;
    if (a.kind === "step" && b.kind === "step") {
        return a.step.id === b.step.id && a.isFallback === b.isFallback && isSameTarget(a.target, b.target);
    }
    return true;
}

function resolveNode<TExtra extends Record<string, unknown>>(
    node: ReactNode | ((extra: Partial<TExtra>) => ReactNode) | undefined,
    extra: Partial<TExtra>,
): ReactNode {
    return typeof node === "function" ? node(extra) : node;
}

export function TutorialRunner<TExtra extends Record<string, unknown>>({
    definition,
}: {
    definition: TutorialDefinition<TExtra>;
}) {
    const [snapshot, setSnapshot] = useState<RunnerSnapshot<TExtra>>({
        phase: "loading",
        display: { kind: "hidden" },
        canGoToPreviousStep: false,
        extra: {},
    });

    const definitionRef = useRef(definition);
    definitionRef.current = definition;
    const snapshotRef = useRef(snapshot);
    snapshotRef.current = snapshot;

    const dataRef = useRef<TutorialRunData<TExtra>>({ completedStepIds: [], extra: {} });
    const phaseRef = useRef<RunnerPhase>("loading");
    const failureRef = useRef<{ stepId: string; since: number } | null>(null);

    const findStep = (stepId: string): TutorialStep<TExtra> | null => {
        const def = definitionRef.current;
        return (
            def.steps.find((step) => step.id === stepId) ??
            def.repairs?.find((step) => step.id === stepId) ??
            null
        );
    };

    const getPendingStep = (): TutorialStep<TExtra> | null => {
        const completed = dataRef.current.completedStepIds;
        return definitionRef.current.steps.find((step) => !completed.includes(step.id)) ?? null;
    };

    const mergeExtra = (partial: Partial<TExtra> | void | undefined): void => {
        if (partial == null) return;
        dataRef.current = { ...dataRef.current, extra: { ...dataRef.current.extra, ...partial } };
    };

    const publish = (display: RunnerDisplay<TExtra>): void => {
        const next: RunnerSnapshot<TExtra> = {
            phase: phaseRef.current,
            display,
            canGoToPreviousStep: dataRef.current.completedStepIds.length > 0,
            extra: dataRef.current.extra,
        };
        const prev = snapshotRef.current;
        if (
            prev.phase === next.phase &&
            prev.canGoToPreviousStep === next.canGoToPreviousStep &&
            prev.extra === next.extra &&
            isSameDisplay(prev.display, next.display)
        ) {
            return;
        }
        snapshotRef.current = next;
        setSnapshot(next);
    };

    const persist = (status: TutorialStatus): void => {
        const def = definitionRef.current;
        void saveTutorialProgress(def.tutorialGroupId, def.tutorialId, status, dataRef.current);
    };

    const finishRun = (status: "completed" | "interrupted"): void => {
        phaseRef.current = "finished";
        failureRef.current = null;
        persist(status);
        publish({ kind: "hidden" });
        if (status === "completed") {
            definitionRef.current.onCompleted?.();
        }
    };

    const completeStep = async (step: TutorialStep<TExtra>, assignedExtra?: Partial<TExtra>): Promise<void> => {
        if (getPendingStep()?.id !== step.id) return;
        mergeExtra(assignedExtra);
        dataRef.current = {
            ...dataRef.current,
            completedStepIds: [...dataRef.current.completedStepIds, step.id],
        };
        failureRef.current = null;
        mergeExtra(await step.onComplete?.(dataRef.current.extra));
        if (getPendingStep() == null) {
            finishRun("completed");
            return;
        }
        revalidate();
        persist("pending-action");
    };

    const goToPreviousStep = (): void => {
        const completed = dataRef.current.completedStepIds;
        if (completed.length === 0) return;
        dataRef.current = { ...dataRef.current, completedStepIds: completed.slice(0, -1) };
        failureRef.current = null;
        persist("pending-action");
        revalidate();
    };

    const resolveStepTarget = (step: TutorialStep<TExtra>): StepTarget | null => {
        const extra = dataRef.current.extra;
        step.prepare?.(extra);
        return typeof step.target === "function" ? step.target(extra) : step.target;
    };

    const stepRequiresMet = (step: TutorialStep<TExtra>): boolean =>
        step.requires == null || step.requires(dataRef.current.extra);

    /** Runs `prepare`, resolves the target, and returns it when all prerequisites hold. */
    const passingTarget = (step: TutorialStep<TExtra>): StepTarget | null => {
        const target = resolveStepTarget(step);
        if (!stepRequiresMet(step)) return null;
        if (target == null || !isTargetPresent(target)) return null;
        return target;
    };

    const resolveFallbackDisplay = (step: TutorialStep<TExtra>): RunnerDisplay<TExtra> => {
        const visited = new Set([step.id]);
        let fallbackId = step.fallback;
        while (fallbackId != null && !visited.has(fallbackId)) {
            visited.add(fallbackId);
            const fallbackStep = findStep(fallbackId);
            if (fallbackStep == null) break;
            const target = passingTarget(fallbackStep);
            if (target != null) {
                if ("hidden" in target) {
                    fallbackId = fallbackStep.fallback;
                    continue;
                }
                return { kind: "step", step: fallbackStep, isFallback: true, target };
            }
            fallbackId = fallbackStep.fallback;
        }
        return { kind: "interrupted" };
    };

    const revalidate = (): void => {
        if (phaseRef.current !== "running") return;

        const step = getPendingStep();
        if (step == null) {
            finishRun("completed");
            return;
        }

        if (step.isDone?.(dataRef.current.extra)) {
            completeStep(step);
            return;
        }

        let display: RunnerDisplay<TExtra>;
        const target = resolveStepTarget(step);
        const requiresMet = stepRequiresMet(step);
        const targetReady = target != null && isTargetPresent(target);

        if (requiresMet && targetReady) {
            failureRef.current = null;
            display = { kind: "step", step, isFallback: false, target };
        } else if (requiresMet) {
            // Requirements are met but the spotlight target is not in the DOM yet — wait
            // reactively without falling back to a repair step.
            failureRef.current = null;
            display = { kind: "hidden" };
        } else {
            if (failureRef.current?.stepId !== step.id) {
                // eslint-disable-next-line react-hooks/purity -- revalidate is only called from effects, not during render
                failureRef.current = { stepId: step.id, since: performance.now() };
            }
            // eslint-disable-next-line react-hooks/purity -- revalidate is only called from effects, not during render
            const graceRemaining = performance.now() - failureRef.current.since < (step.graceMs ?? DEFAULT_GRACE_MS);
            display = graceRemaining ? { kind: "hidden" } : resolveFallbackDisplay(step);
        }

        if (
            display.kind === "step" &&
            display.step.keepStickyBarVisible &&
            !breadcrumbStore.getState().stickyBarVisible
        ) {
            window.scrollBy({ top: -10 });
        }

        publish(display);
    };

    const engineRef = useRef({ revalidate, completeStep, finishRun, goToPreviousStep, getPendingStep, mergeExtra, persist });
    engineRef.current = { revalidate, completeStep, finishRun, goToPreviousStep, getPendingStep, mergeExtra, persist };

    const location = useLocation();

    useEffect(() => {
        if (phaseRef.current !== "running") return;
        engineRef.current.revalidate();
    }, [location.pathname]);

    useEffect(() => {
        let cancelled = false;
        const def = definitionRef.current;

        void (async () => {
            const record = await getTutorialProgressRecord(def.tutorialGroupId, def.tutorialId);
            if (cancelled || record?.status !== "pending-action") return;
            dataRef.current = isRunData(record.metadata)
                ? (record.metadata as TutorialRunData<TExtra>)
                : { completedStepIds: [], extra: {} };
            phaseRef.current = "running";
            engineRef.current.revalidate();
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let frame = 0;
        const requestRevalidate = (): void => {
            if (frame !== 0) return;
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                engineRef.current.revalidate();
            });
        };

        const observer = new MutationObserver(requestRevalidate);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        const intervalId = window.setInterval(() => engineRef.current.revalidate(), SAFETY_REVALIDATE_INTERVAL_MS);
        window.addEventListener("popstate", requestRevalidate);

        const unsubscribes = (definitionRef.current.revalidateOn ?? []).map((subscribe) =>
            subscribe(requestRevalidate),
        );

        return () => {
            observer.disconnect();
            if (frame !== 0) window.cancelAnimationFrame(frame);
            window.clearInterval(intervalId);
            window.removeEventListener("popstate", requestRevalidate);
            for (const unsubscribe of unsubscribes) unsubscribe();
        };
    }, []);

    useEffect(() => {
        const cleanups: Array<() => void> = [
            listenAppEvent(events.TUTORIAL_STOP_BUTTON_CLICKED, () => {
                if (phaseRef.current !== "running") return;
                engineRef.current.finishRun("interrupted");
            }),
            listenAppEvent(events.TUTORIAL_PREV_BUTTON_CLICKED, () => {
                if (phaseRef.current !== "running") return;
                engineRef.current.goToPreviousStep();
            }),
            listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
                if (phaseRef.current !== "running") return;
                if (snapshotRef.current.display.kind === "interrupted") {
                    engineRef.current.finishRun("interrupted");
                }
            }),
        ];

        for (const recorder of definitionRef.current.recorders ?? []) {
            cleanups.push(
                listenAppEvent(recorder.event, (event) => {
                    if (phaseRef.current !== "running") return;
                    engineRef.current.mergeExtra(
                        (recorder.assign as (payload: unknown, extra: Partial<TExtra>) => Partial<TExtra>)(
                            event.detail,
                            dataRef.current.extra,
                        ),
                    );
                    engineRef.current.persist("pending-action");
                    engineRef.current.revalidate();
                }),
            );
        }

        const completionEvents = new Set<AppEventName>();
        for (const step of definitionRef.current.steps) {
            if (step.completeOn == null) continue;
            completionEvents.add(typeof step.completeOn === "string" ? step.completeOn : step.completeOn.event);
        }

        for (const eventName of completionEvents) {
            cleanups.push(
                listenAppEvent(eventName, (event) => {
                    if (phaseRef.current !== "running") return;

                    const step = engineRef.current.getPendingStep();
                    if (step?.completeOn == null) return;
                    const completion =
                        typeof step.completeOn === "string" ? { event: step.completeOn } : step.completeOn;
                    if (completion.event !== eventName) return;

                    const display = snapshotRef.current.display;
                    if (display.kind === "interrupted") return;
                    // The primary action button belongs to the displayed UI, so it only
                    // completes the step whose UI is actually on screen.
                    if (eventName === events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED) {
                        if (display.kind !== "step" || display.isFallback || display.step.id !== step.id) return;
                    }

                    const assign = "assign" in completion ? completion.assign : undefined;
                    void engineRef.current.completeStep(
                        step,
                        (assign as ((payload: unknown) => Partial<TExtra>) | undefined)?.(event.detail),
                    );
                }),
            );
        }

        return () => {
            for (const cleanup of cleanups) cleanup();
        };
    }, []);

    const { display } = snapshot;

    useEffect(() => {
        if (display.kind === "step") {
            const target = display.target;
            if ("pinToTop" in target) {
                pinToTop(target.pinToTop);
            } else if ("elementId" in target) {
                setTargetSpotlightOverlayElementId(target.elementId, { placement: target.placement });
            } else if ("selector" in target) {
                setTargetSpotlightOverlayElementSelector(target.selector, { placement: target.placement });
            } else {
                setTargetSpotlightOverlayElementId(null);
            }
        } else if (display.kind === "interrupted") {
            pinToTop({ status: "error" });
        } else {
            setTargetSpotlightOverlayElementId(null);
        }
    }, [display]);

    useEffect(
        () => () => {
            setTargetSpotlightOverlayElementId(null);
        },
        [],
    );

    if (display.kind === "hidden") return null;
    if (display.kind === "step" && "hidden" in display.target) return null;

    const content =
        display.kind === "interrupted"
            ? definition.interrupted.content
            : resolveNode(display.step.content, snapshot.extra);
    const actions =
        display.kind === "interrupted"
            ? definition.interrupted.actions
            : resolveNode(display.step.actions, snapshot.extra);

    return (
        <>
            <SpotlightContent>{content}</SpotlightContent>
            <SpotlightActions>
                <SpotlightPrevButton disabled={!snapshot.canGoToPreviousStep} />
                <SpotlightStopButton />
                {actions != null ? <div className="ml-auto flex items-center gap-1.5">{actions}</div> : null}
            </SpotlightActions>
        </>
    );
}
