"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { useAppState } from "@/modules/app-state";
import { clearTutorialSpotlight } from "@/modules/tutorials/hooks/use-tutorial-stop-listener";
import { useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useEffect } from "react";

const TUTORIAL_ID = "your-first-project" as const;

const STEPS = ["overview", "done"] as const;

export function YourFirstProjectTutorial() {
    const appState = useAppState();
    const { currentStep, goNext } = useTutorialSteps(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, STEPS);

    useEffect(() => {
        if (currentStep !== "overview") return;

        pinToTop({ status: "info" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Your first project</p>
                <p className="text-muted-foreground mt-1">
                    Get familiar with the dashboard UI and create your first project. This short tutorial introduces
                    the basics before you dive in.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
            { showStopButton: true },
        );

        const stopListeningPrimary = listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            goNext();
        });

        return () => {
            stopListeningPrimary();
            clearTutorialSpotlight();
        };
    }, [currentStep, appState, goNext]);

    useEffect(() => {
        if (currentStep !== "done") return;

        pinToTop({ status: "success" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Tutorial complete!</p>
                <p className="text-muted-foreground mt-1">
                    Congratulations! You&apos;ve completed the tutorial. The tutorial modal will open so you can
                    continue with the other tutorials.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Ok</SpotlightPrimaryActionButton>,
            { showStopButton: true },
        );

        const stopListeningPrimary = listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            if (goNext()) {
                clearTutorialSpotlight();
                emitSignupTutorialOpen({ force: true });
            }
        });

        return () => {
            stopListeningPrimary();
            clearTutorialSpotlight();
        };
    }, [currentStep, appState, goNext]);

    return null;
}
