"use client";

import { APP_DEVELOP_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_CHAT_COMPOSER_ID } from "@/pages/dashboard/projects/[projectId]/conversations/components/controls";
import {
    APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID,
    APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID,
    APP_STAGE_DEPLOY_MODAL_ID,
    assignLastReleaseControllerStageButtonSpotlightId,
    assignLastReleaseControllerStageReleaseLinkSpotlightId,
    isStageDeployModalOpen,
} from "@/pages/dashboard/projects/[projectId]/conversations/components/message/release-controller-tutorial-targets";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import {
    setTargetSpotlightOverlayElementId,
    SpotlightFillChatPromptButton,
    SpotlightFillUnitFilterButton,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { events } from "@/services/events";
import { isConversationSessionUrl, isNewConversationUrl, isProjectSelectedUrl } from "@/services/routes";
import { APP_RELEASE_UNITS_FILTER_INPUT_ID } from "@/modules/project/release-units-all/release-units-all-panel";
import { APP_UNIT_CHANGES_MODAL_ID } from "@/modules/project-chat";
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
                    const isDevelopButtonRendered = () => document.getElementById(APP_DEVELOP_BUTTON_ID) != null;
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isDevelopButtonRendered()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isDevelopButtonRendered },
                    );

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
                    const isChatComposerReady = () =>
                        document.getElementById(APP_CHAT_COMPOSER_ID) != null &&
                        isNewConversationUrl(window.location.pathname);
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isChatComposerReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isChatComposerReady },
                    );

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
                    const isConversationChatReady = () =>
                        document.getElementById(APP_CHAT_COMPOSER_ID) != null &&
                        isConversationSessionUrl(window.location.pathname);
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isConversationChatReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isConversationChatReady },
                    );

                    const [lostTargetRes, firstUnitId] = await ctx.race(
                        lostTarget,
                        (async () => {
                            const [unitData] = await Promise.all([
                                ctx.once(events.CREATE_UNIT_RECEIVED_EVENT),
                                ctx.once(events.RELEASE_CONTROLLER_RECEIVED_EVENT),
                            ]);
                            return unitData.payload?.created_unit?.id;
                        })(),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("develop-button");
                        return;
                    }

                    void ctx.next(firstUnitId ? { firstUnitId } : {});
                },
            },
            {
                id: "copy-unit-id",
                handler: async (ctx) => {
                    const state = ctx.getState();
                    const firstUnitId = state.firstUnitId;

                    if (!firstUnitId) {
                        void ctx.next({});
                        return;
                    }

                    const targetElementId = `tutorial-first-unit-id-badge-${firstUnitId}`;
                    const isUnitCardReady = () => document.getElementById(targetElementId) != null;
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isUnitCardReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isUnitCardReady },
                    );

                    setTargetSpotlightOverlayElementId(targetElementId, { placement: "top" });

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Copy the unit ID</p>
                            <p className="text-muted-foreground mt-1">
                                Click on the unit ID badge to copy it. You'll need this ID to filter units later.
                            </p>
                        </>
                    );

                    const [lostTargetRes] = await ctx.race(
                        lostTarget,
                        ctx.once(events.UNIT_ID_BADGE_COPIED_EVENT),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("develop-button");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "open-unit-changes-modal",
                handler: async (ctx) => {
                    const state = ctx.getState();
                    const firstUnitId = state.firstUnitId;

                    if (!firstUnitId) {
                        void ctx.goTo("develop-button");
                        return;
                    }

                    const targetElementId = `tutorial-first-unit-card-${firstUnitId}`;
                    const isUnitCardReady = () => document.getElementById(targetElementId) != null;
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isUnitCardReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isUnitCardReady },
                    );

                    setTargetSpotlightOverlayElementId(targetElementId);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">View your new unit</p>
                            <p className="text-muted-foreground mt-1">
                                Click the unit card to open its changes view. Review the details, then close the modal to continue.
                            </p>
                        </>
                    );

                    const [lostTargetRes] = await ctx.race(
                        lostTarget,
                        ctx.once(events.UNIT_CHANGES_MODAL_OPENED_EVENT),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("develop-button");
                        return;
                    }

                    setTargetSpotlightOverlayElementId(null);
                    void ctx.next({});
                },
            },
            {
                id: "review-unit-changes-modal",
                handler: async (ctx) => {
                    const isModalReady = () => document.getElementById(APP_UNIT_CHANGES_MODAL_ID) != null;
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isModalReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isModalReady },
                    );

                    const [lostTargetRes] = await ctx.race(
                        lostTarget,
                        ctx.once(events.UNIT_CHANGES_MODAL_CLOSED_EVENT),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("open-unit-changes-modal");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "wait-for-release-stage-modal-opened",
                handler: async (ctx) => {
                    const isReleaseStageButtonReady = () =>
                        assignLastReleaseControllerStageButtonSpotlightId() &&
                        isConversationSessionUrl(window.location.pathname);
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isReleaseStageButtonReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isReleaseStageButtonReady },
                    );

                    assignLastReleaseControllerStageButtonSpotlightId();
                    setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Deploy to stage</p>
                            <p className="text-muted-foreground mt-1">
                                Click the stage button on the latest release controller to open the deploy modal.
                            </p>
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.STAGE_DEPLOY_MODAL_OPENED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("chat-composer-input");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "wait-for-deploy-on-stage",
                handler: async (ctx) => {
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isStageDeployModalOpen()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isStageDeployModalOpen },
                    );

                    setTargetSpotlightOverlayElementId(APP_STAGE_DEPLOY_MODAL_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Choose a stage runtime</p>
                            <p className="text-muted-foreground mt-1">
                                Pick a stage runtime and deploy your release. You can deploy to an idle runtime or swap an
                                existing live release.
                            </p>
                        </>,
                    );

                    const [lostTargetRes, runtimeId] = await ctx.race(
                        lostTarget,
                        ctx.once(events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT),
                    );

                    if (lostTargetRes) {
                        ctx.goTo("wait-for-release-stage-modal-opened");
                        return;
                    }

                    void ctx.next(runtimeId ? { stageRuntimeId: runtimeId } : {});
                },
            },
            {
                id: "wait-for-click-on-stage-release-button-to-go-to-release-page",
                handler: async (ctx) => {
                    const isStageReleaseLinkReady = () =>
                        assignLastReleaseControllerStageReleaseLinkSpotlightId() &&
                        isConversationSessionUrl(window.location.pathname);
                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isStageReleaseLinkReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isStageReleaseLinkReady },
                    );

                    assignLastReleaseControllerStageReleaseLinkSpotlightId();
                    setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Open the release page</p>
                            <p className="text-muted-foreground mt-1">
                                Click the stage release badge to open the release page and inspect your deployed units.
                            </p>
                        </>,
                    );

                    const [lostTargetRes] = await ctx.race(lostTarget, ctx.once(events.STAGE_RELEASE_BADGE_CLICKED_EVENT));

                    if (lostTargetRes) {
                        ctx.goTo("wait-for-deploy-on-stage");
                        return;
                    }

                    void ctx.next({});
                },
            },
            {
                id: "filter-unit-by-id",
                handler: async (ctx) => {
                    const state = ctx.getState();
                    const firstUnitId = state.firstUnitId;

                    if (!firstUnitId) {
                        void ctx.goTo("generic-interrupted");
                        return;
                    }

                    const isUnitFilterReady = () => document.getElementById(APP_RELEASE_UNITS_FILTER_INPUT_ID) != null;

                    const lostTarget = ctx.intervalBreak(
                        1000,
                        (breakInterval) => {
                            if (!isUnitFilterReady()) {
                                breakInterval();
                            }
                        },
                        { untilReady: isUnitFilterReady },
                    );

                    setTargetSpotlightOverlayElementId(APP_RELEASE_UNITS_FILTER_INPUT_ID);

                    ctx.setSpotlightContent(
                        <>
                            <p className="font-medium">Filter units by ID</p>
                            <p className="text-muted-foreground mt-1">
                                You can filter units by their ID using this input. Use the button below to fill the ID we copied earlier or paste it manually.
                            </p>
                        </>,
                        <SpotlightFillUnitFilterButton unitId={firstUnitId}>
                            Fill unit ID
                        </SpotlightFillUnitFilterButton>
                    );

                    const [lostTargetRes] = await ctx.race(
                        lostTarget,
                        (async () => {
                            await ctx.once(events.RELEASE_UNITS_FILTER_APPLIED_EVENT);
                            await ctx.once(events.RELEASE_UNITS_LOADED_EVENT);
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
