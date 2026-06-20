"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import {
    setTargetSpotlightOverlayElementId,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { useSteps } from "@/modules/tutorials/steps";
import type { YourFirstProjectTutorialData } from "./types";

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
                            inside, at the end you can re-click it to close the inbox.
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
