"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { elevateTargetSpotlightZIndex, pinToTop, resetTargetSpotlightZIndex, setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { ActivePage, useAppState } from "@/modules/app-state";
import { useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import { scrollWindowByWhenSettled } from "@/lib/dom";
import { useEffect } from "react";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_USER_MENU_BUTTON_ID } from "@/modules/layout/components/nav-user";
import { APP_CREATE_PROJECT_LINK_ID, APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_CREATE_PROJECT_FORM_ID } from "@/pages/dashboard/projects/new/page";
import { clearTutorialSpotlight } from "../../hooks/use-tutorial-stop-listener";

const LAYOUT_SETTLE_DEBOUNCE_MS = 250;

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
    const { currentStep, goNext, goTo } = useTutorialSteps(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, STEPS);

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
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, goNext);
    }, [currentStep, goNext]);

    useDebouncedEffect(
        () => {
            if (currentStep !== "inbox") return;

            if (appState.isNotificationDropdownOpen) {
                clearTutorialSpotlight();

                return listenAppEvent(events.NOTIFICATION_CLOSED_EVENT, goNext);
            }

            const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                ? scrollWindowByWhenSettled({ top: -10 })
                : undefined;

            setTargetSpotlightOverlayElementId(APP_NOTIFICATION_INBOX_BUTTON_ID, { zIndexLayout: 'layout' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Your inbox</p>
                    <p className="text-muted-foreground mt-1">
                        This is your inbox. You can find all tutorials here later. Try clicking it to see what's
                        inside, then close the inbox to proceed with the tutorial.
                    </p>
                </>,
            );

            return () => {
                cancelPendingScroll?.();
            };
        },
        [currentStep, goNext, appState.isBreadcrumbStickyVisible, appState.isNotificationDropdownOpen],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        () => {
            if (currentStep !== "theme-switcher") return;

            const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                ? scrollWindowByWhenSettled({ top: -10 })
                : undefined;

            setTargetSpotlightOverlayElementId(APP_THEME_SWITCHER_BUTTON_ID, { zIndexLayout: 'layout' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Personalize your theme</p>
                    <p className="text-muted-foreground mt-1">
                        You can switch the app's theme here. Click the button multiple times to toggle between
                        available themes. By default, the theme follows your system setting.
                    </p>
                </>,
                <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
            );

            const stopListening = listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, goNext);

            return () => {
                cancelPendingScroll?.();
                stopListening();
            };
        },
        [currentStep, goNext, appState.isBreadcrumbStickyVisible],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        () => {
            if (currentStep !== "user-menu") return;

            if (!appState.isMainSidebarOpen) {
                const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                    ? scrollWindowByWhenSettled({ top: -10 })
                    : undefined;

                setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID, { zIndexLayout: 'layout' });

                setSpotlightContentToRender(
                    <>
                        <p className="font-medium">Open the sidebar</p>
                        <p className="text-muted-foreground mt-1">
                            Use this button to open the sidebar and continue with the tutorial.
                        </p>
                    </>,
                );

                return () => {
                    cancelPendingScroll?.();
                };
            }

            if (appState.isUserMenuDropdownOpen) {
                clearTutorialSpotlight();

                return listenAppEvent(events.USER_MENU_CLOSED_EVENT, goNext);
            }

            setTargetSpotlightOverlayElementId(APP_USER_MENU_BUTTON_ID, { zIndexLayout: 'layout' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Your account menu</p>
                    <p className="text-muted-foreground mt-1">
                        Open the user menu to see your profile and settings. Close it to proceed with the tutorial.
                    </p>
                </>,
            );
        },
        [currentStep, goNext, appState.isBreadcrumbStickyVisible, appState.isMainSidebarOpen, appState.isUserMenuDropdownOpen],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        () => {
            if (currentStep !== "projects-switch-menu") return;

            if (!appState.isMainSidebarOpen) {
                const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                    ? scrollWindowByWhenSettled({ top: -10 })
                    : undefined;

                setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID, { zIndexLayout: 'layout' });

                setSpotlightContentToRender(
                    <>
                        <p className="font-medium">Expand the sidebar to continue</p>
                        <p className="text-muted-foreground mt-1">
                            Use this button to open the sidebar and continue with the tutorial.
                        </p>
                    </>,
                );

                return () => {
                    cancelPendingScroll?.();
                };
            }

            if (appState.isProjectSwitchDropdownOpen) {
                setTargetSpotlightOverlayElementId(APP_CREATE_PROJECT_LINK_ID, { zIndexLayout: 'layout' });
                elevateTargetSpotlightZIndex();

                setSpotlightContentToRender(
                    <>
                        <p className="font-medium">Go to `Add project` form</p>
                        <p className="text-muted-foreground mt-1">
                            Now click on `Add project` to go to the form.
                        </p>
                    </>,
                );

                const stopListening = listenAppEvent(events.PROJECT_CREATE_BUTTON_CLICKED_EVENT, goNext);
    
                return () => {
                    resetTargetSpotlightZIndex();
                    stopListening();
                };
            }

            setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID, { zIndexLayout: 'layout' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">See projects</p>
                    <p className="text-muted-foreground mt-1">
                        Using this button you can switch between projects. Click it to see the list of projects and `Add project` button.
                    </p>
                </>,
            );
        },
        [currentStep, goNext, appState.isBreadcrumbStickyVisible, appState.isMainSidebarOpen, appState.isProjectSwitchDropdownOpen],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        () => {
            if (currentStep !== "project-create-form") return;

            if (appState.activePage !== ActivePage.CREATE_PROJECT) {
                goTo("projects-switch-menu");
                return;
            }

            setTargetSpotlightOverlayElementId(APP_CREATE_PROJECT_FORM_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Create your project</p>
                    <p className="text-muted-foreground mt-1">
                        Fill in the form and click `Create project` when you're ready.
                    </p>
                </>,
            );

            return listenAppEvent(events.PROJECT_CREATED_EVENT, goNext);
        },
        [currentStep, goNext, goTo, appState.activePage],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

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
            <SpotlightPrimaryActionButton>Close</SpotlightPrimaryActionButton>,
            { showStopButton: false },
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
            if (goNext()) {
                emitSignupTutorialOpen({ force: true });
            }
        });
    }, [currentStep, goNext]);

    return null;
}
