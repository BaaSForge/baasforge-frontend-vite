"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { useAppState } from "@/modules/app-state";
import { useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { useEffect } from "react";

const TUTORIAL_ID = "your-first-project" as const;

const STEPS = [
    "overview",
    "inbox",
    "theme-switcher",
    "user-menu",
    "projects-switch-menu",
    "project-create-form",
    "done",
] as const;

export function YourFirstProjectTutorial() {
    const appState = useAppState();
    const { currentStep, goNext } = useTutorialSteps(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, STEPS);

    useEffect(() => {
        if (currentStep !== "overview") return;

        pinToTop({ status: "info" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Let's tour the dashboard</p>
                <p className="text-muted-foreground mt-1">
                    Before we create a project, let's learn a bit about the dashboard. Then we'll create your
                    first project.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Let's go!</SpotlightPrimaryActionButton>,
            { showStopButton: true },
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            goNext();
        });
    }, [currentStep, goNext]);

    useEffect(() => {
        if (currentStep !== "inbox") return;

        if (!appState.isBreadcrumbStickyVisible) {
            window.scrollBy({ top: -10 });
        }

        setTargetSpotlightOverlayElementId(APP_NOTIFICATION_INBOX_BUTTON_ID);

        setSpotlightContentToRender(
            <>
                <p className="font-medium">Your inbox</p>
                <p className="text-muted-foreground mt-1">
                    This is your inbox. You can find all tutorials here later. Try clicking it to see what's
                    inside, then close the inbox to proceed with the tutorial.
                </p>
            </>,
            null,
            { showStopButton: true },
        );

        return listenAppEvent(events.NOTIFICATION_CLOSED_EVENT, () => {
            goNext();
        });
    }, [currentStep, goNext, appState.isBreadcrumbStickyVisible]);

    useEffect(() => {
        if (currentStep !== "theme-switcher") return;

        if (!appState.isBreadcrumbStickyVisible) {
            window.scrollBy({ top: -10 });
        }

        setTargetSpotlightOverlayElementId(APP_THEME_SWITCHER_BUTTON_ID);

        setSpotlightContentToRender(
            <>
                <p className="font-medium">Personalize your theme</p>
                <p className="text-muted-foreground mt-1">
                    You can switch the app's theme here. Click the button multiple times to toggle between
                    available themes. By default, the theme follows your system setting.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
            { showStopButton: true },
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            goNext();
        });
    }, [currentStep, goNext, appState.isBreadcrumbStickyVisible]);

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

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            if (goNext()) {
                emitSignupTutorialOpen({ force: true });
            }
        });
    }, [currentStep, appState, goNext]);

    return null;
}
