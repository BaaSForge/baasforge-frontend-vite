"use client";

import { SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useSteps } from "@/modules/tutorials/steps";
import type { WriteAndCallYourApiTutorialData } from "./types";

const TUTORIAL_ID = "write-and-call-your-api" as const;

export function WriteAndCallYourApiTutorial() {
    useSteps<WriteAndCallYourApiTutorialData>(
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
                            <p className="font-medium">Write and call your API</p>
                            <p className="text-muted-foreground mt-1">
                                In this tutorial you'll write your first API, learn about built units, deploy to stage,
                                and call it with the built-in HTTP client.
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
