"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_USER_MENU_BUTTON_ID } from "@/modules/layout/components/nav-user";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { closeMainSidebarIfMobile, isMainSidebarClosed } from "@/components/ui/sidebar";
import {
    elevateTargetSpotlightOverlayZIndex,
    resetTargetSpotlightOverlayZIndex,
    setTargetSpotlightOverlayElementId,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { useSteps } from "@/modules/tutorials/steps";
import type { YourFirstProjectTutorialData } from "./types";
import { APP_CREATE_PROJECT_FORM_ID } from "@/modules/project";

const TUTORIAL_ID = "your-first-project" as const;

export function YourFirstProjectTutorial() {
    useSteps<YourFirstProjectTutorialData>(
        {
            tutorialGroupId: WELCOME_TUTORIALS_GROUP_ID,
            tutorialId: TUTORIAL_ID,
        },
        [
            {
                id: "overview",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            Before we create a project, let's learn a bit about the dashboard. Then we'll create your
                            first project.
                        </>,
                        <SpotlightPrimaryActionButton>
                            Got it!
                        </SpotlightPrimaryActionButton>
                    );
                    ctx.pinToTop({ status: "info" });
                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);
                    void ctx.next();
                },
            },
            {
                id: "inbox",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(500, (breakInterval) => {
                        const foundTarget = document.getElementById(APP_NOTIFICATION_INBOX_BUTTON_ID) != null;
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_NOTIFICATION_INBOX_BUTTON_ID);
                    ctx.interval(500, () => {
                        if (!breadcrumbStore.getState().stickyBarVisible) {
                            window.scrollBy({ top: -10 });
                        }
                    });

                    ctx.setSpotlightContent(
                        <>
                            This is your inbox. You can find all tutorials here later. Try clicking it to see what's
                            inside, at the end you can re-click it to close the inbox to proceed with the tutorial.
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.NOTIFICATION_CLOSED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("generic-interrupted");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "theme-switch",
                handler: async (ctx) => {
                    setTargetSpotlightOverlayElementId(APP_THEME_SWITCHER_BUTTON_ID);
                    ctx.interval(500, () => {
                        if (!breadcrumbStore.getState().stickyBarVisible) {
                            window.scrollBy({ top: -10 });
                        }
                    });

                    ctx.setSpotlightContent(
                        <>
                            You can switch the app's theme here. Click the button multiple times to toggle between available themes. By default, the theme follows your system setting.
                        </>,
                        <SpotlightPrimaryActionButton>
                            Got it!
                        </SpotlightPrimaryActionButton>
                    );

                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);

                    void ctx.next({});
                },
            },
            {
                id: "sidebar-toggle",
                handler: async (ctx) => {
                    setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);
                    ctx.interval(500, () => {
                        if (!breadcrumbStore.getState().stickyBarVisible) {
                            window.scrollBy({ top: -10 });
                        }
                    });

                    const sidebarClosed = isMainSidebarClosed();

                    if (sidebarClosed) {
                        ctx.setSpotlightContent(
                            <>
                                Use this button to open the sidebar and continue with the tutorial.
                            </>,
                        );
                        await ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT);
                    } else {
                        ctx.setSpotlightContent(
                            <>
                                Use this button to show or hide the sidebar. to proceed with the tutorial, close the sidebar and open it again.
                            </>,
                        );
                        
                        await ctx.once(events.MAIN_SIDEBAR_CLOSED_EVENT);
                        await ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT);
                    }

                    void ctx.next({});
                },
            },
            {
                id: "user-menu",
                handler: async (ctx) => {
                    const sidebarClosed = isMainSidebarClosed();

                    if (sidebarClosed) {
                        setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);
                        ctx.interval(500, () => {
                            if (!breadcrumbStore.getState().stickyBarVisible) {
                                window.scrollBy({ top: -10 });
                            }
                        });
                        ctx.setSpotlightContent(
                            <>
                                Use this button to open the sidebar and continue with the tutorial.
                            </>,
                        );
                        await ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT);
                    }

                    elevateTargetSpotlightOverlayZIndex();
                    setTargetSpotlightOverlayElementId(APP_USER_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            Open the user menu to see your profile and settings. Close it to proceed with the tutorial.
                        </>,
                    );

                    await ctx.once(events.USER_MENU_OPENED_EVENT);
                    resetTargetSpotlightOverlayZIndex();
                    await ctx.once(events.USER_MENU_CLOSED_EVENT);

                    closeMainSidebarIfMobile();

                    void ctx.next({});
                    resetTargetSpotlightOverlayZIndex();
                },
            },
            {
                id: "projects-switch-menu",
                handler: async (ctx) => {
                    const sidebarClosed = isMainSidebarClosed();

                    if (sidebarClosed) {
                        setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);
                        ctx.interval(500, () => {
                            if (!breadcrumbStore.getState().stickyBarVisible) {
                                window.scrollBy({ top: -10 });
                            }
                        });
                        ctx.setSpotlightContent(
                            <>
                                Use this button to open the sidebar and continue with the tutorial.
                            </>,
                        );
                        await ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT);
                    }

                    elevateTargetSpotlightOverlayZIndex();
                    setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            Using this button you can switch between projects. Click it to see the list of projects. Then click on `Add project`.
                        </>,
                    );

                    await ctx.once(events.PROJECT_SWITCH_MENU_OPENED_EVENT);
                    resetTargetSpotlightOverlayZIndex();
                    await ctx.once(events.PROJECT_CREATE_BUTTON_CLICKED_EVENT);

                    closeMainSidebarIfMobile();

                    void ctx.next({});
                },
            },
            {
                id: "project-create-form",
                handler: async (ctx) => {
                    setTargetSpotlightOverlayElementId(APP_CREATE_PROJECT_FORM_ID);

                    ctx.setSpotlightContent(
                        <>
                            Now you can create a new project. Fill the form and click on `Create project`.
                        </>,
                    );

                    await ctx.once(events.PROJECT_CREATED_EVENT);

                    void ctx.next({});
                },
            },
            {
                id: "done",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            Congratulations! You've completed the tutorial.
                        </>,
                        <SpotlightPrimaryActionButton>
                            Close
                        </SpotlightPrimaryActionButton>
                    );
                    ctx.pinToTop({ status: "success" });
                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);
                    await ctx.markCompleted();
                },
            },
            {
                id: "generic-interrupted",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            Sorry but something went wrong. You can retry the tutorial later.
                        </>,
                        <SpotlightPrimaryActionButton>
                            Ok
                        </SpotlightPrimaryActionButton>
                    );
                    ctx.pinToTop({ status: "error" });
                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);
                    await ctx.markInterrupted();
                },
            },
        ],
    );

    return null;
}
