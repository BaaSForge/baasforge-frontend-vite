"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import type { TutorialRunData } from "@/modules/tutorials/engine";
import { events, listenAppEvent } from "@/services/events";
import {
    getTutorialProgressRecord,
    saveTutorialProgress,
    type TutorialGroupId,
    type TutorialId,
} from "@/services/tutorials";
import { useCallback, useEffect, useRef, useState } from "react";

import { clearTutorialSpotlight, useTutorialStopListener } from "./use-tutorial-stop-listener";

export const TUTORIAL_INTERRUPTED_STEP = "interrupted" as const;

type TutorialStepRunData<TExtra extends Record<string, unknown>> = TutorialRunData<TExtra> & {
    interrupted?: boolean;
};

function isTutorialStepRunData<TExtra extends Record<string, unknown>>(
    value: unknown,
): value is TutorialStepRunData<TExtra> {
    if (value == null || typeof value !== "object") return false;
    const data = value as TutorialStepRunData<TExtra>;
    return Array.isArray(data.completedStepIds) && data.completedStepIds.every((id) => typeof id === "string");
}

export function parseTutorialStepRunData<TExtra extends Record<string, unknown>>(
    value: unknown,
): TutorialStepRunData<TExtra> {
    if (!isTutorialStepRunData<TExtra>(value)) {
        return { completedStepIds: [], extra: {} };
    }

    return {
        completedStepIds: value.completedStepIds,
        extra: value.extra ?? {},
        ...(value.interrupted ? { interrupted: true } : {}),
    };
}

function getActiveTutorialStep<TStep extends string>(
    steps: readonly TStep[],
    completedStepIds: readonly string[],
): TStep | null {
    return steps.find((id) => !completedStepIds.includes(id)) ?? null;
}

export function useLoadTutorialMetadata<TExtra extends Record<string, unknown> = Record<string, never>>(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
) {
    return useCallback(async (): Promise<Partial<TExtra>> => {
        const record = await getTutorialProgressRecord(tutorialGroupId, tutorialId);
        const data = parseTutorialStepRunData<TExtra>(record?.metadata);
        return data.extra ?? {};
    }, [tutorialGroupId, tutorialId]);
}

export function useTutorialSteps<
    const TSteps extends readonly string[],
    TExtra extends Record<string, unknown> = Record<string, never>,
>(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    steps: TSteps,
): {
    currentStep: TSteps[number] | typeof TUTORIAL_INTERRUPTED_STEP | null;
    goNext: () => boolean;
    goTo: (stepId: TSteps[number]) => void;
    goToInterrupted: () => void;
    mergeTutorialMetadata: (partial: Partial<TExtra>) => void;
    loadTutorialMetadata: () => Promise<Partial<TExtra>>;
} {
    type StepId = TSteps[number];

    const [completedStepIds, setCompletedStepIds] = useState<string[] | null>(null);
    const [showInterruptedStep, setShowInterruptedStep] = useState(false);
    const extraRef = useRef<Partial<TExtra>>({});

    const currentStep = showInterruptedStep
        ? TUTORIAL_INTERRUPTED_STEP
        : completedStepIds == null
          ? null
          : getActiveTutorialStep(steps, completedStepIds);

    const buildRunData = useCallback(
        (nextCompletedStepIds: readonly string[], interrupted = showInterruptedStep): TutorialStepRunData<TExtra> => ({
            completedStepIds: [...nextCompletedStepIds],
            extra: { ...extraRef.current },
            ...(interrupted ? { interrupted: true } : {}),
        }),
        [showInterruptedStep],
    );

    const getRunStatus = useCallback(
        (nextCompletedStepIds: readonly string[]): "pending-action" | "completed" =>
            getActiveTutorialStep(steps, nextCompletedStepIds) == null ? "completed" : "pending-action",
        [steps],
    );

    useTutorialStopListener(
        tutorialGroupId,
        tutorialId,
        () => buildRunData(completedStepIds ?? []),
        completedStepIds !== null && !showInterruptedStep,
    );

    useEffect(() => {
        let cancelled = false;

        void getTutorialProgressRecord(tutorialGroupId, tutorialId).then((record) => {
            if (cancelled || record?.status !== "pending-action") return;

            const data = parseTutorialStepRunData<TExtra>(record.metadata);
            extraRef.current = data.extra ?? {};
            setCompletedStepIds(data.completedStepIds);
            if (data.interrupted) setShowInterruptedStep(true);
        });

        return () => {
            cancelled = true;
        };
    }, [tutorialGroupId, tutorialId]);

    useEffect(() => {
        if (currentStep !== TUTORIAL_INTERRUPTED_STEP) return;

        pinToTop({ status: "error" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Tutorial interrupted</p>
                <p className="text-muted-foreground mt-1">
                    Sorry, something went wrong. You can retry the tutorial later.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Ok</SpotlightPrimaryActionButton>,
            { showStopButton: false },
        );

        const stopListeningPrimary = listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            void saveTutorialProgress(
                tutorialGroupId,
                tutorialId,
                "interrupted",
                buildRunData(completedStepIds ?? [], true),
            );
            clearTutorialSpotlight();
            emitSignupTutorialOpen({ force: true });
        });

        return () => {
            stopListeningPrimary();
            clearTutorialSpotlight();
        };
    }, [buildRunData, completedStepIds, currentStep, tutorialGroupId, tutorialId]);

    const persist = useCallback(
        (metadata: TutorialStepRunData<TExtra>, status: "pending-action" | "completed") => {
            void saveTutorialProgress(tutorialGroupId, tutorialId, status, metadata);
        },
        [tutorialGroupId, tutorialId],
    );

    const completeStep = useCallback(
        (stepId: StepId): boolean => {
            const nextCompletedStepIds = [...(completedStepIds ?? []), stepId];
            setCompletedStepIds(nextCompletedStepIds);
            setShowInterruptedStep(false);

            const finished = getActiveTutorialStep(steps, nextCompletedStepIds) == null;
            persist(buildRunData(nextCompletedStepIds, false), finished ? "completed" : "pending-action");
            return finished;
        },
        [buildRunData, completedStepIds, persist, steps],
    );

    const goNext = useCallback((): boolean => {
        if (currentStep == null || currentStep === TUTORIAL_INTERRUPTED_STEP) return false;
        return completeStep(currentStep);
    }, [completeStep, currentStep]);

    const goTo = useCallback(
        (stepId: StepId): void => {
            setShowInterruptedStep(false);

            const index = steps.indexOf(stepId);
            if (index === -1) return;

            const nextCompletedStepIds = [...steps.slice(0, index)];
            setCompletedStepIds(nextCompletedStepIds);
            persist(buildRunData(nextCompletedStepIds, false), "pending-action");
        },
        [buildRunData, persist, steps],
    );

    const goToInterrupted = useCallback(() => {
        setShowInterruptedStep(true);
        persist(buildRunData(completedStepIds ?? [], true), "pending-action");
    }, [buildRunData, completedStepIds, persist]);

    const mergeTutorialMetadata = useCallback(
        (partial: Partial<TExtra>) => {
            extraRef.current = { ...extraRef.current, ...partial };
            persist(
                buildRunData(completedStepIds ?? [], showInterruptedStep),
                getRunStatus(completedStepIds ?? []),
            );
        },
        [buildRunData, completedStepIds, getRunStatus, persist, showInterruptedStep],
    );

    const loadTutorialMetadata = useCallback(async (): Promise<Partial<TExtra>> => {
        if (completedStepIds !== null) return { ...extraRef.current };

        const record = await getTutorialProgressRecord(tutorialGroupId, tutorialId);
        const data = parseTutorialStepRunData<TExtra>(record?.metadata);
        extraRef.current = data.extra ?? {};
        return { ...extraRef.current };
    }, [completedStepIds, tutorialGroupId, tutorialId]);

    useEffect(() => {
        return () => {
            clearTutorialSpotlight();
        };
    }, []);

    return { currentStep, goNext, goTo, goToInterrupted, mergeTutorialMetadata, loadTutorialMetadata };
}
