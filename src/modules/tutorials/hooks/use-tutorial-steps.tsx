"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { events, listenAppEvent } from "@/services/events";
import {
    getTutorialProgressRecord,
    saveTutorialProgress,
    type TutorialGroupId,
    type TutorialId,
} from "@/services/tutorials";
import { useCallback, useEffect, useState } from "react";

import { clearTutorialSpotlight, useTutorialStopListener } from "./use-tutorial-stop-listener";

export const TUTORIAL_INTERRUPTED_STEP = "interrupted" as const;

type TutorialStepRunData = {
    completedStepIds: string[];
    interrupted?: boolean;
};

function isTutorialStepRunData(value: unknown): value is TutorialStepRunData {
    if (value == null || typeof value !== "object") return false;
    const data = value as TutorialStepRunData;
    return Array.isArray(data.completedStepIds) && data.completedStepIds.every((id) => typeof id === "string");
}

function getActiveTutorialStep<TStep extends string>(
    steps: readonly TStep[],
    completedStepIds: readonly string[],
): TStep | null {
    return steps.find((id) => !completedStepIds.includes(id)) ?? null;
}

export function useTutorialSteps<const TSteps extends readonly string[]>(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    steps: TSteps,
): {
    currentStep: TSteps[number] | typeof TUTORIAL_INTERRUPTED_STEP | null;
    goNext: () => boolean;
    goTo: (stepId: TSteps[number]) => void;
    goToInterrupted: () => void;
} {
    type StepId = TSteps[number];

    const [completedStepIds, setCompletedStepIds] = useState<string[] | null>(null);
    const [showInterruptedStep, setShowInterruptedStep] = useState(false);

    const currentStep = showInterruptedStep
        ? TUTORIAL_INTERRUPTED_STEP
        : completedStepIds == null
          ? null
          : getActiveTutorialStep(steps, completedStepIds);

    useTutorialStopListener(
        tutorialGroupId,
        tutorialId,
        completedStepIds,
        completedStepIds !== null && !showInterruptedStep,
    );

    useEffect(() => {
        let cancelled = false;

        void getTutorialProgressRecord(tutorialGroupId, tutorialId).then((record) => {
            if (cancelled || record?.status !== "pending-action") return;

            const data = isTutorialStepRunData(record.metadata) ? record.metadata : { completedStepIds: [] };
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
            void saveTutorialProgress(tutorialGroupId, tutorialId, "interrupted", {
                completedStepIds: [...(completedStepIds ?? [])],
            });
            clearTutorialSpotlight();
            emitSignupTutorialOpen({ force: true });
        });

        return () => {
            stopListeningPrimary();
            clearTutorialSpotlight();
        };
    }, [completedStepIds, currentStep, tutorialGroupId, tutorialId]);

    const persist = useCallback(
        (metadata: TutorialStepRunData, status: "pending-action" | "completed") => {
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
            persist({ completedStepIds: nextCompletedStepIds }, finished ? "completed" : "pending-action");
            return finished;
        },
        [completedStepIds, persist, steps],
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
            persist({ completedStepIds: nextCompletedStepIds }, "pending-action");
        },
        [persist, steps],
    );

    const goToInterrupted = useCallback(() => {
        setShowInterruptedStep(true);
        persist(
            {
                completedStepIds: [...(completedStepIds ?? [])],
                interrupted: true,
            },
            "pending-action",
        );
    }, [completedStepIds, persist]);

    useEffect(() => {
        return () => {
            clearTutorialSpotlight();
        };
    }, []);

    return { currentStep, goNext, goTo, goToInterrupted };
}
