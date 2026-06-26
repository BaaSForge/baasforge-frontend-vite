"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import { APP_USER_MENU_BUTTON_ID } from "@/modules/layout/components/nav-user";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import { setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { ensureMainSidebarOpen, useSteps } from "@/modules/tutorials/steps";
import type { YourFirstProjectTutorialData } from "./types";
import { APP_CREATE_PROJECT_FORM_ID } from "@/pages/dashboard/projects/new/page";

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
                            <p className="font-medium">Let's tour the dashboard</p>
                            <p className="text-muted-foreground mt-1">
                                Before we create a project, let's learn a bit about the dashboard. Then we'll create your
                                first project.
                            </p>
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
                    const lostTarget = ctx.intervalBreak(1000, (breakInterval) => {
                        const foundTarget = document.getElementById(APP_NOTIFICATION_INBOX_BUTTON_ID) != null;
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_NOTIFICATION_INBOX_BUTTON_ID);
                    ctx.interval(1000, () => {
                        if (!breadcrumbStore.getState().stickyBarVisible) {
                            window.scrollBy({ top: -10 });
                        }
                    });

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Your inbox</p>
                            <p className="text-muted-foreground mt-1">
                                This is your inbox. You can find all tutorials here later. Try clicking it to see what's
                                inside, then close the inbox to proceed with the tutorial.
                            </p>
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
                    ctx.interval(1000, () => {
                        if (!breadcrumbStore.getState().stickyBarVisible) {
                            window.scrollBy({ top: -10 });
                        }
                    });

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Personalize your theme</p>
                            <p className="text-muted-foreground mt-1">
                                You can switch the app's theme here. Click the button multiple times to toggle between
                                available themes. By default, the theme follows your system setting.
                            </p>
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
                id: "ensure-sidebar-is-opened-before-user-menu",
                handler: async (ctx) => {
                    await ensureMainSidebarOpen(
                        ctx,
                        {
                            title: "Open the sidebar",
                            description: "Use this button to open the sidebar and continue with the tutorial.",
                        },
                        { keepStickyBarVisible: true },
                    );

                    void ctx.next({});
                },
            },
            {
                id: "user-menu",
                handler: async (ctx) => {
                    const sidebarClosed = ctx.intervalBreak(1000, (breakInterval) => {
                        if (isMainSidebarClosed()) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_USER_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Your account menu</p>
                            <p className="text-muted-foreground mt-1">
                                Open the user menu to see your profile and settings. Close it to proceed with the
                                tutorial.
                            </p>
                        </>,
                    );

                    const [sidebarClosedRes] = await ctx.race(
                        sidebarClosed,
                        (async () => {
                            await ctx.once(events.USER_MENU_OPENED_EVENT);
                            await ctx.once(events.USER_MENU_CLOSED_EVENT);
                        })(),
                    );

                    if (sidebarClosedRes) {
                        ctx.goTo("ensure-sidebar-is-opened-before-user-menu");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "ensure-sidebar-is-opened-before-projects-switch-menu",
                handler: async (ctx) => {
                    await ensureMainSidebarOpen(
                        ctx,
                        {
                            title: "Expand the sidebar to continue",
                            description: "Use this button to open the sidebar and continue with the tutorial.",
                        },
                        { keepStickyBarVisible: true },
                    );

                    void ctx.next({});
                },
            },
            {
                id: "projects-switch-menu",
                handler: async (ctx) => {
                    const sidebarClosed = ctx.intervalBreak(1000, (breakInterval) => {
                        if (isMainSidebarClosed()) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Add a project</p>
                            <p className="text-muted-foreground mt-1">
                                Using this button you can switch between projects. Click it to see the list of projects,
                                then click on `Add project`.
                            </p>
                        </>,
                    );

                    const [sidebarClosedRes] = await ctx.race(
                        sidebarClosed,
                        (async () => {
                            await ctx.once(events.PROJECT_SWITCH_MENU_OPENED_EVENT);
                            await ctx.once(events.PROJECT_CREATE_BUTTON_CLICKED_EVENT);
                        })(),
                    );

                    if (sidebarClosedRes) {
                        ctx.goTo("ensure-sidebar-is-opened-before-projects-switch-menu");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "project-create-form",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(1000, (breakInterval) => {
                        const foundTarget = document.getElementById(APP_CREATE_PROJECT_FORM_ID) != null;
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_CREATE_PROJECT_FORM_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Create your first project</p>
                            <p className="text-muted-foreground mt-1">
                                Fill in the form and click `Create project` when you're ready.
                            </p>
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.PROJECT_CREATED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("projects-switch-menu");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "done",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Tutorial complete!</p>
                            <p className="text-muted-foreground mt-1">
                                Congratulations! You've completed the tutorial. The tutorial modal will open so you can
                                continue with the other tutorials.
                            </p>
                        </>,
                        <SpotlightPrimaryActionButton>
                            Close
                        </SpotlightPrimaryActionButton>
                    );
                    ctx.pinToTop({ status: "success" });
                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);

                    emitSignupTutorialOpen({ force: true });
                    await ctx.markCompleted();
                },
            },
            {
                id: "generic-interrupted",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Tutorial interrupted</p>
                            <p className="text-muted-foreground mt-1">
                                Sorry, something went wrong. You can retry the tutorial later.
                            </p>
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
