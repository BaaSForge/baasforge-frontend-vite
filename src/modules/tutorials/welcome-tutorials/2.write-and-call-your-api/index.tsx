"use client";

import { closeScalarClientModal } from "@/components/scalar-http-operation-client/close-scalar-client-modal";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import {
    SpotlightFillChatPromptButton,
    SpotlightFillUnitFilterButton,
    SpotlightPrimaryActionButton,
} from "@/components/target-spotlight-overlay";
import { APP_DEVELOP_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_UNIT_CHANGES_MODAL_ID } from "@/modules/project-chat";
import { APP_RELEASE_UNITS_FILTER_INPUT_ID } from "@/modules/project/release-units-all/release-units-all-panel";
import { TutorialRunner, type TutorialDefinition } from "@/modules/tutorials/engine";
import { APP_CHAT_COMPOSER_ID } from "@/pages/dashboard/projects/[projectId]/conversations/components/controls";
import {
    APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID,
    APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID,
    APP_STAGE_DEPLOY_MODAL_ID,
    assignLastReleaseControllerStageButtonSpotlightId,
    assignLastReleaseControllerStageReleaseLinkSpotlightId,
    isStageDeployModalOpen,
} from "@/pages/dashboard/projects/[projectId]/conversations/components/message/release-controller-tutorial-targets";
import { events } from "@/services/events";
import {
    getSelectedProjectIdFromPathname,
    isConversationSessionUrl,
    isNewConversationUrl,
    isProjectSelectedUrl,
} from "@/services/routes";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { isMainSidebarClosed, isMainSidebarOpen, mainSidebarStore } from "@/stores/main-sidebar";
import {
    tutorialFirstUnitLiveInteractionButtonId,
    tutorialFirstUnitScalarResponseBodySectionId,
    tutorialFirstUnitScalarResponseHeadersButtonId,
    tutorialFirstUnitScalarSendButtonId,
    tutorialFirstUnitScalarTestRequestButtonId,
} from "./tutorial-target-ids";

const TUTORIAL_HELLO_WORLD_PROMPT = "Write an api which returns a simple `hello world`";

type WriteAndCallExtra = {
    projectId: string;
    firstUnitId: string;
    stageRuntimeId: string;
};

const OPEN_SIDEBAR_REPAIR_ID = "open-sidebar";

const onConversationSessionPage = () =>
    isConversationSessionUrl(window.location.pathname) && document.getElementById(APP_CHAT_COMPOSER_ID) != null;

const onDevelopChatPage = () =>
    (isNewConversationUrl(window.location.pathname) || isConversationSessionUrl(window.location.pathname)) &&
    document.getElementById(APP_CHAT_COMPOSER_ID) != null;

const currentProjectId = (): Partial<WriteAndCallExtra> | void => {
    const projectId = getSelectedProjectIdFromPathname(window.location.pathname);
    if (projectId) return { projectId };
};

const definition: TutorialDefinition<WriteAndCallExtra> = {
    tutorialGroupId: WELCOME_TUTORIALS_GROUP_ID,
    tutorialId: "write-and-call-your-api",
    revalidateOn: [
        (listener) => mainSidebarStore.subscribe(listener),
        (listener) => breadcrumbStore.subscribe(listener),
    ],
    onCompleted: () => emitSignupTutorialOpen({ force: true }),
    interrupted: {
        content: (
            <>
                <p className="font-medium">Tutorial interrupted</p>
                <p className="text-muted-foreground mt-1">
                    Sorry, something went wrong. You can retry the tutorial later.
                </p>
            </>
        ),
        actions: <SpotlightPrimaryActionButton>Ok</SpotlightPrimaryActionButton>,
    },
    recorders: [
        {
            event: events.CREATE_UNIT_RECEIVED_EVENT,
            assign: (message, extra) => {
                if (extra.firstUnitId != null) return {};
                const unitId = message.payload?.created_unit?.id;
                return unitId ? { firstUnitId: unitId } : {};
            },
        },
        {
            event: events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT,
            assign: (runtimeId) => (runtimeId ? { stageRuntimeId: runtimeId } : {}),
        },
    ],
    repairs: [
        {
            id: OPEN_SIDEBAR_REPAIR_ID,
            target: { elementId: APP_SIDEBAR_TOGGLE_BUTTON_ID },
            requires: isMainSidebarClosed,
            keepStickyBarVisible: true,
            content: (
                <>
                    <p className="font-medium">Expand the sidebar to continue</p>
                    <p className="text-muted-foreground mt-1">
                        Use this button to open the sidebar and continue with the tutorial.
                    </p>
                </>
            ),
        },
    ],
    steps: [
        {
            id: "overview",
            target: { pinToTop: { status: "info" } },
            completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
            content: (
                <>
                    <p className="font-medium">Write and call your API</p>
                    <p className="text-muted-foreground mt-1">
                        In this tutorial you'll write your first API, learn about built units, deploy to stage,
                        and call it with the built-in HTTP client.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
        },
        {
            id: "choose-project",
            target: { elementId: APP_PROJECTS_MENU_BUTTON_ID },
            requires: isMainSidebarOpen,
            fallback: OPEN_SIDEBAR_REPAIR_ID,
            keepStickyBarVisible: true,
            isDone: () => isProjectSelectedUrl(window.location.pathname),
            onComplete: currentProjectId,
            content: (
                <>
                    <p className="font-medium">Choose your project</p>
                    <p className="text-muted-foreground mt-1">
                        Use this button to switch projects. Open the menu and select the project you created in
                        the previous tutorial.
                    </p>
                </>
            ),
        },
        {
            id: "develop-button",
            target: { elementId: APP_DEVELOP_BUTTON_ID },
            requires: () => isProjectSelectedUrl(window.location.pathname),
            fallback: "choose-project",
            keepStickyBarVisible: true,
            completeOn: events.DEVELOP_BUTTON_CLICKED_EVENT,
            isDone: () => isNewConversationUrl(window.location.pathname),
            content: (
                <>
                    <p className="font-medium">Open the develop chat</p>
                    <p className="text-muted-foreground mt-1">
                        Click the Develop button to open the chat where you'll ask AI to write your first API.
                    </p>
                </>
            ),
        },
        {
            id: "chat-composer-input",
            target: { elementId: APP_CHAT_COMPOSER_ID },
            requires: onDevelopChatPage,
            fallback: "develop-button",
            isDone: () => isConversationSessionUrl(window.location.pathname),
            content: (
                <>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-muted-foreground mt-1">
                        Send this message to ask AI to write your first API. When AI is done, we'll come back to
                        go ahead and deploy the to stage runtime.
                    </p>
                    <blockquote className="my-4 border-l-2 border-muted pl-3 text-sm text-muted-foreground">
                        {TUTORIAL_HELLO_WORLD_PROMPT}
                    </blockquote>
                </>
            ),
            actions: <SpotlightFillChatPromptButton text={TUTORIAL_HELLO_WORLD_PROMPT} />,
        },
        {
            id: "waiting-for-unit-creation",
            target: { hidden: true },
            requires: onConversationSessionPage,
            fallback: "develop-button",
            isDone: (extra) => extra.firstUnitId != null,
        },
        {
            id: "copy-unit-id",
            target: (extra) =>
                extra.firstUnitId
                    ? { elementId: `tutorial-first-unit-id-badge-${extra.firstUnitId}`, placement: "top" }
                    : null,
            requires: onConversationSessionPage,
            fallback: "develop-button",
            completeOn: events.UNIT_ID_BADGE_COPIED_EVENT,
            content: (
                <>
                    <p className="font-medium">Copy the unit ID</p>
                    <p className="text-muted-foreground mt-1">
                        This is the ID of the unit just created.
                        Click on the unit ID badge to copy it. You'll need this ID to filter units later.
                    </p>
                </>
            ),
        },
        {
            id: "open-unit-changes-modal",
            target: (extra) =>
                extra.firstUnitId ? { elementId: `tutorial-first-unit-card-${extra.firstUnitId}` } : null,
            requires: onConversationSessionPage,
            fallback: "develop-button",
            completeOn: events.UNIT_CHANGES_MODAL_OPENED_EVENT,
            isDone: () => document.getElementById(APP_UNIT_CHANGES_MODAL_ID) != null,
            content: (
                <>
                    <p className="font-medium">View your new unit</p>
                    <p className="text-muted-foreground mt-1">
                        Click the unit card to open its changes view. Review the details, then close the modal to
                        continue.
                        <br />
                        You don't need to do anything in this modal. Just see what it contains, then close it.
                    </p>
                </>
            ),
        },
        {
            id: "review-unit-changes-modal",
            target: { hidden: true },
            requires: () => document.getElementById(APP_UNIT_CHANGES_MODAL_ID) != null,
            fallback: "open-unit-changes-modal",
            completeOn: events.UNIT_CHANGES_MODAL_CLOSED_EVENT,
        },
        {
            id: "deploy-to-stage",
            prepare: () => assignLastReleaseControllerStageButtonSpotlightId(),
            target: { elementId: APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID },
            requires: () => isConversationSessionUrl(window.location.pathname),
            fallback: "develop-button",
            completeOn: events.STAGE_DEPLOY_MODAL_OPENED_EVENT,
            isDone: isStageDeployModalOpen,
            content: (
                <>
                    <p className="font-medium">Deploy to stage</p>
                    <p className="text-muted-foreground mt-1">
                        Click the latest release button at the bottom to open the deploy modal.
                    </p>
                </>
            ),
        },
        {
            id: "choose-stage-runtime",
            target: { elementId: APP_STAGE_DEPLOY_MODAL_ID },
            requires: isStageDeployModalOpen,
            fallback: "deploy-to-stage",
            completeOn: events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT,
            onComplete: currentProjectId,
            content: (
                <>
                    <p className="font-medium">Choose a stage runtime</p>
                    <p className="text-muted-foreground mt-1">
                        Pick a stage runtime and deploy your release. You can deploy to an idle runtime or swap an
                        existing live release.
                    </p>
                </>
            ),
        },
        {
            id: "open-release-page",
            prepare: () => assignLastReleaseControllerStageReleaseLinkSpotlightId(),
            target: { elementId: APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID },
            requires: () => isConversationSessionUrl(window.location.pathname),
            fallback: "choose-stage-runtime",
            completeOn: events.STAGE_RELEASE_BADGE_CLICKED_EVENT,
            content: (
                <>
                    <p className="font-medium">Open the release page</p>
                    <p className="text-muted-foreground mt-1">
                        Click again on the stage release badge to open the release page and inspect your deployed
                        units.
                    </p>
                </>
            ),
        },
        {
            id: "filter-unit-by-id",
            target: { elementId: APP_RELEASE_UNITS_FILTER_INPUT_ID },
            requires: (extra) => extra.firstUnitId != null,
            fallback: "open-release-page",
            completeOn: events.RELEASE_UNITS_FILTER_APPLIED_EVENT,
            content: (
                <>
                    <p className="font-medium">Filter units by ID</p>
                    <p className="text-muted-foreground mt-1">
                        You can filter units by their ID using this input. Use the button below to fill the ID we
                        copied earlier or paste it manually.
                    </p>
                </>
            ),
            actions: (extra) =>
                extra.firstUnitId ? (
                    <SpotlightFillUnitFilterButton unitId={extra.firstUnitId}>
                        Fill unit ID
                    </SpotlightFillUnitFilterButton>
                ) : null,
        },
        {
            id: "call-unit-live-interaction",
            target: (extra) =>
                extra.firstUnitId
                    ? { elementId: tutorialFirstUnitLiveInteractionButtonId(extra.firstUnitId) }
                    : null,
            fallback: "filter-unit-by-id",
            completeOn: events.UNIT_LIVE_INTERACTION_CLICKED_EVENT,
            content: (
                <>
                    <p className="font-medium">Expand live interaction section</p>
                    <p className="text-muted-foreground mt-1">
                        Click Live interaction to open the built-in client to continue.
                    </p>
                </>
            ),
        },
        {
            id: "start-scalar-http-client",
            target: (extra) =>
                extra.firstUnitId
                    ? { elementId: tutorialFirstUnitScalarTestRequestButtonId(extra.firstUnitId) }
                    : null,
            fallback: "call-unit-live-interaction",
            completeOn: events.SCALAR_TEST_REQUEST_CLICKED_EVENT,
            content: (
                <>
                    <p className="font-medium">Open the HTTP client modal</p>
                    <p className="text-muted-foreground mt-1">
                        Click Test Request to open the built-in client modal.
                    </p>
                </>
            ),
        },
        {
            id: "send-scalar-http-request",
            target: (extra) =>
                extra.firstUnitId ? { elementId: tutorialFirstUnitScalarSendButtonId(extra.firstUnitId) } : null,
            fallback: "start-scalar-http-client",
            completeOn: events.SCALAR_SEND_CLICKED_EVENT,
            content: (
                <>
                    <p className="font-medium">Send your request</p>
                    <p className="text-muted-foreground mt-1">
                        Click Send to call your API and get the response.
                    </p>
                </>
            ),
        },
        {
            id: "copy-scalar-trace-id",
            target: (extra) =>
                extra.firstUnitId
                    ? { elementId: tutorialFirstUnitScalarResponseHeadersButtonId(extra.firstUnitId) }
                    : null,
            fallback: "send-scalar-http-request",
            completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
            content: (
                <>
                    <p className="font-medium">Response headers</p>
                    <p className="text-muted-foreground mt-1">
                        Here are the response headers from your call. The value of{" "}
                        <code className="text-foreground">X-Trace-Id</code> header will be used for debugging in
                        later tutorials.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Got it</SpotlightPrimaryActionButton>,
        },
        {
            id: "review-scalar-response-body",
            target: (extra) =>
                extra.firstUnitId
                    ? { elementId: tutorialFirstUnitScalarResponseBodySectionId(extra.firstUnitId) }
                    : null,
            fallback: "copy-scalar-trace-id",
            completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
            onComplete: () => {
                closeScalarClientModal();
            },
            content: (
                <>
                    <p className="font-medium">Response body</p>
                    <p className="text-muted-foreground mt-1">
                        This is the response from the API unit you just created.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Got it</SpotlightPrimaryActionButton>,
        },
        {
            id: "done",
            target: { pinToTop: { status: "success" } },
            completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
            content: (
                <>
                    <p className="font-medium">Tutorial complete!</p>
                    <p className="text-muted-foreground mt-1">
                        Congratulations! You've completed the tutorial. The tutorial modal will open so you can
                        continue with the other tutorials.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Close</SpotlightPrimaryActionButton>,
        },
    ],
};

export function WriteAndCallYourApiTutorial() {
    return <TutorialRunner definition={definition} />;
}
