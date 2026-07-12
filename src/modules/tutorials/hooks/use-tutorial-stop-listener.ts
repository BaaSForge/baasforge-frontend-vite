"use client";

import { setTargetSpotlightOverlayElementId } from "@/components/target-spotlight-overlay";
import { clearSpotlightContent } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { events, listenAppEvent } from "@/services/events";
import { saveTutorialProgress, type TutorialGroupId, type TutorialId } from "@/services/tutorials";
import { useEffect, type RefObject } from "react";

export function clearTutorialSpotlight(): void {
    setTargetSpotlightOverlayElementId(null);
    clearSpotlightContent();
}

export function useTutorialStopListener(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    completedStepIdsRef: RefObject<readonly string[]>,
    enabled: boolean,
): void {
    useEffect(() => {
        if (!enabled) return;

        return listenAppEvent(events.TUTORIAL_STOP_BUTTON_CLICKED, () => {
            void saveTutorialProgress(tutorialGroupId, tutorialId, "interrupted", {
                completedStepIds: [...completedStepIdsRef.current],
            });
            clearTutorialSpotlight();
        });
    }, [enabled, tutorialGroupId, tutorialId, completedStepIdsRef]);
}
