"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import {
    pinToTop,
    setTargetSpotlightOverlayElementId,
    SpotlightActions,
    SpotlightContent,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import {
    saveTutorialProgress,
    useTutorialProgressRecord,
    WELCOME_TUTORIALS_GROUP_ID,
} from "@/services/tutorials";
import { useCallback, useEffect } from "react";
import { asYourFirstProjectTutorialRecord } from "./types";

const TUTORIAL_ID = "your-first-project" as const;

export function YourFirstProjectTutorial() {
    const record = asYourFirstProjectTutorialRecord(
        useTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID),
    );
    const isInboxStep = record?.metadata?.step === "inbox";

    useEffect(() => {
        if (record == null) return;

        if (isInboxStep) {
            const timer = window.setTimeout(() => {
                window.scrollBy({ top: -10 });
                setTargetSpotlightOverlayElementId(APP_NOTIFICATION_INBOX_BUTTON_ID);
            }, 5000);

            return () => {
                window.clearTimeout(timer);
                setTargetSpotlightOverlayElementId(null);
            };
        }

        pinToTop({ status: "info" });

        return () => setTargetSpotlightOverlayElementId(null);
    }, [record, isInboxStep]);

    const handleGotIt = useCallback(() => {
        void saveTutorialProgress(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, "pending-action", { step: "inbox" });
    }, []);

    if (record == null) return null;

    if (isInboxStep) {
        return (
            <SpotlightContent>
                This is your inbox. You can find all tutorials here later. Try clicking it to see what's inside.
            </SpotlightContent>
        );
    }

    return (
        <>
            <SpotlightContent>
                Before we create a project, let's learn a bit about the dashboard. Then we'll create your first
                project.
            </SpotlightContent>
            <SpotlightActions>
                <SpotlightPrimaryActionButton type="button" onClick={handleGotIt}>
                    Got it!
                </SpotlightPrimaryActionButton>
            </SpotlightActions>
        </>
    );
}
