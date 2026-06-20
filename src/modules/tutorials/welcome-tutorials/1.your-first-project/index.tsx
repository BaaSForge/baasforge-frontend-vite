"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import {
    setTargetSpotlightOverlayElementId,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { events, triggerAppEvent } from "@/services/events";
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
                id: "step1",
                handler: async (ctx) => {
                    ctx.setSpotlightContent(
                        <>
                            Before we create a project, let's learn a bit about the dashboard. Then we'll create your
                            first project.
                        </>,
                        <SpotlightPrimaryActionButton
                            type="button"
                            onClick={() => triggerAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED)}
                        >
                            Got it!
                        </SpotlightPrimaryActionButton>
                    );
                    ctx.pinToTop({ status: "info" });
                    await ctx.once(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);
                    void ctx.next();
                },
            },
            {
                id: "step2",
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
                            inside.
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.NOTIFICATION_OPENED_EVENT));

                    if (lostTargetRes) {
                        setTargetSpotlightOverlayElementId(null);
                        void ctx.goTo("step1");
                        return;
                    }

                    setTargetSpotlightOverlayElementId(null);
                    void ctx.next({
                        someData: "",
                        someAdditionalData: "",
                    });
                },
            },
            {
                id: "step3",
                handler: async (ctx) => {
                    ctx.getState();
                },
            },
        ],
    );

    return null;
}
