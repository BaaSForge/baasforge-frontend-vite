"use client";

import {
    pinToTop,
    setTargetSpotlightOverlayElementId,
    SpotlightActions,
    SpotlightContent,
    SpotlightPrimaryActionButton,
    SpotlightSecondaryActionButton,
} from "@/components/target-spotlight-overlay";
import {
    getTutorialProgressRecord,
    getTutorialProgressSnapshot,
    subscribeTutorialProgress,
    WELCOME_TUTORIALS_GROUP_ID,
} from "@/services/tutorials";
import { useEffect, useSyncExternalStore } from "react";

export function YourFirstProjectTutorial() {
    const progressVersion = useSyncExternalStore(
        subscribeTutorialProgress,
        getTutorialProgressSnapshot,
        getTutorialProgressSnapshot,
    );

    useEffect(() => {
        pinToTop({ status: "info" });
        return () => setTargetSpotlightOverlayElementId(null);
    }, []);

    useEffect(() => {
        void getTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, "your-first-project").then((record) => {
            console.log("your-first-project tutorial recorded data", record);
        });
    }, [progressVersion]);

    return (
        <>
            <SpotlightContent>
                Your first project tutorial
            </SpotlightContent>
            <SpotlightActions>
                <SpotlightSecondaryActionButton type="button">Back</SpotlightSecondaryActionButton>
                <SpotlightPrimaryActionButton type="button">Continue</SpotlightPrimaryActionButton>
            </SpotlightActions>
        </>
    );
}
