"use client";

import { APP_DEVELOP_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_CHAT_COMPOSER_ID } from "@/pages/dashboard/projects/[projectId]/conversations/components/controls";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import {
    setTargetSpotlightOverlayElementId,
    SpotlightFillChatPromptButton,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { events } from "@/services/events";
import { isConversationSessionUrl, isNewConversationUrl, isProjectSelectedUrl } from "@/services/routes";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { ensureMainSidebarOpen, useSteps } from "@/modules/tutorials/steps";
import type { WriteAndCallYourApiTutorialData } from "./types";

const TUTORIAL_ID = "write-and-call-your-api" as const;

const TUTORIAL_HELLO_WORLD_PROMPT = "Write an api which returns a simple `hello world`";

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
                id: "ensure-sidebar-is-opened-before-project-select",
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
                id: "choose-project",
                handler: async (ctx) => {
                    if (isProjectSelectedUrl(window.location.pathname)) {
                        ctx.goTo("ensure-sidebar-is-opened-before-develop-button");
                        return;
                    }

                    const sidebarClosed = ctx.intervalBreak(1000, (breakInterval) => {
                        if (isMainSidebarClosed()) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Choose your project</p>
                            <p className="text-muted-foreground mt-1">
                                Use this button to switch projects. Open the menu and select the project you created in
                                the previous tutorial.
                            </p>
                        </>,
                    );

                    const [sidebarClosedRes] = await ctx.race(
                        sidebarClosed,
                        (async () => {
                            await ctx.once(events.PROJECT_SWITCH_MENU_OPENED_EVENT);
                            await ctx.once(events.PROJECT_SELECTED_EVENT);
                        })(),
                    );

                    if (sidebarClosedRes) {
                        ctx.goTo("ensure-sidebar-is-opened-before-project-select");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "ensure-sidebar-is-opened-before-develop-button",
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
                id: "develop-button",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(1000, (breakInterval) => {
                        const foundTarget = document.getElementById(APP_DEVELOP_BUTTON_ID) != null;
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_DEVELOP_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Open the develop chat</p>
                            <p className="text-muted-foreground mt-1">
                                Click the Develop button to open the chat where you'll ask AI to write your first API.
                            </p>
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.DEVELOP_BUTTON_CLICKED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("ensure-sidebar-is-opened-before-project-select");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "chat-composer-input",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(1000, (breakInterval) => {
                        const foundTarget =
                            document.getElementById(APP_CHAT_COMPOSER_ID) != null &&
                            isNewConversationUrl(window.location.pathname);
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    setTargetSpotlightOverlayElementId(APP_CHAT_COMPOSER_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Start a conversation</p>
                            <p className="text-muted-foreground mt-1">
                                Send this message to ask AI to write your first API. When AI is done, we'll come back to go ahead and deploy the to stage runtime.
                            </p>
                            <blockquote className="my-4 border-l-2 border-muted pl-3 text-sm text-muted-foreground">
                                {TUTORIAL_HELLO_WORLD_PROMPT}
                            </blockquote>
                        </>,
                        <SpotlightFillChatPromptButton text={TUTORIAL_HELLO_WORLD_PROMPT} />,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.MESSAGE_RECEIVED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("develop-button");
                        return;
                    }

                    setTargetSpotlightOverlayElementId(null);
                    ctx.clearSpotlightContent();
                    void ctx.next({});
                },
            },
            {
                id: "waiting-for-unit-creation",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(1000, (breakInterval) => {
                        const foundTarget =
                            document.getElementById(APP_CHAT_COMPOSER_ID) != null &&
                            isConversationSessionUrl(window.location.pathname);
                        if (!foundTarget) {
                            breakInterval();
                        }
                    });

                    const [lostTargetRes] = await ctx.race(
                        lostTarget,
                        (async () => {
                            await Promise.all([
                                ctx.once(events.CREATE_UNIT_RECEIVED_EVENT),
                                ctx.once(events.RELEASE_CONTROLLER_RECEIVED_EVENT),
                            ]);
                        })(),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("develop-button");
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
