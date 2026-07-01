"use client";

import { APP_RUNTIMES_MENU_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import { setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { events } from "@/services/events";
import { isProjectRuntimesListUrl } from "@/services/routes";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import {
    createChooseProjectStep,
    createEnsureSidebarIsOpenedBeforeProjectSelectStep,
    ensureMainSidebarOpen,
    useSteps,
} from "@/modules/tutorials/steps";
import type { DebugAndReleaseTutorialData } from "./types";

const TUTORIAL_ID = "debug-and-release" as const;

export function DebugAndReleaseTutorial() {
    useSteps<DebugAndReleaseTutorialData>(
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
                            <p className="font-medium">Debug and release</p>
                            <p className="text-muted-foreground mt-1">
                                You'll release your units to production, call them live, and use trace IDs to debug
                                issues. Then you'll ask AI to update your units, redeploy through stage and production,
                                and review production history to learn how to roll back.
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
            createEnsureSidebarIsOpenedBeforeProjectSelectStep<DebugAndReleaseTutorialData>(),
            createChooseProjectStep<DebugAndReleaseTutorialData>({
                onProjectAlreadySelectedStepId: "ensure-sidebar-is-opened-before-click-on-runtimes",
            }),
            {
                id: "ensure-sidebar-is-opened-before-click-on-runtimes",
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
                id: "go-to-runtimes",
                handler: async (ctx) => {
                    if (isProjectRuntimesListUrl(window.location.pathname)) {
                        void ctx.next({});
                        return;
                    }

                    const isSidebarOpen = () => !isMainSidebarClosed();
                    const sidebarClosed = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (isMainSidebarClosed()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isSidebarOpen },
                    );

                    setTargetSpotlightOverlayElementId(APP_RUNTIMES_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Open Runtimes</p>
                            <p className="text-muted-foreground mt-1">
                                Click Runtimes in the sidebar to see where your units run in stage or production.
                            </p>
                        </>,
                    );

                    const [sidebarClosedRes] = await ctx.race(
                        sidebarClosed,
                        ctx.once(events.RUNTIMES_PAGE_MOUNTED_EVENT),
                    );

                    if (sidebarClosedRes) {
                        ctx.goTo("ensure-sidebar-is-opened-before-click-on-runtimes");
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
