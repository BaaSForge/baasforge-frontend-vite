"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { ActivePage, useAppState } from "@/modules/app-state";
import { useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent, triggerAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import { scrollWindowByWhenSettled } from "@/lib/dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { clearTutorialSpotlight } from "../../hooks/use-tutorial-stop-listener";
import { isSubRouteOfPage } from "@/pages/routes";
import { APP_DEVELOP_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_CHAT_COMPOSER_ID } from "@/pages/dashboard/projects/[projectId]/conversations/components/controls";
import { APP_UNIT_CHANGES_MODAL_ID } from "@/modules/project-chat";
import { APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID, APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID, APP_STAGE_DEPLOY_MODAL_ID, assignLastReleaseControllerStageButtonSpotlightId, assignLastReleaseControllerStageReleaseLinkSpotlightId } from "@/pages/dashboard/projects/[projectId]/conversations/components/message/release-controller-tutorial-targets";
import { APP_RELEASE_UNITS_FILTER_INPUT_ID } from "@/modules/project/release-units-all/release-units-all-panel";
import { tutorialFirstUnitLiveInteractionButtonId, tutorialFirstUnitScalarResponseBodySectionId, tutorialFirstUnitScalarResponseHeadersButtonId, tutorialFirstUnitScalarSendButtonId, tutorialFirstUnitScalarTestRequestButtonId } from "./tutorial-target-ids";
import { closeScalarClientModal } from "@/components/scalar-http-operation-client/close-scalar-client-modal";

type WriteAndCallExtra = {
    projectId: string;
    projectTitle: string;
    chatSessionId: string;
    firstUnitId: string;
    stageRuntimeId: string;
};

const TUTORIAL_HELLO_WORLD_PROMPT = "Write an api which returns a simple `hello world`";

const LAYOUT_SETTLE_DEBOUNCE_MS = 250;

const TUTORIAL_ID = "write-and-call-your-api" as const;

const STEPS = [
    "overview",
    "choose-project",
    "develop-button",
    "chat-composer-input",
    "waiting-for-unit-creation",
    "copy-unit-id",
    "open-unit-changes-modal",
    "review-unit-changes-modal",
    "deploy-to-stage",
    "choose-stage-runtime",
    "open-release-page",
    "filter-unit-by-id",
    "call-unit-live-interaction",
    "start-scalar-http-client",
    "send-scalar-http-request",
    "copy-scalar-trace-id",
    "review-scalar-response-body",
    "done",
] as const;

export function WriteAndCallYourApiTutorial() {
    const appState = useAppState();
    const { currentStep, goNext, goTo, mergeTutorialMetadata, loadTutorialMetadata } = useTutorialSteps<
        typeof STEPS,
        WriteAndCallExtra
    >(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, STEPS);

    useEffect(() => {
        if (currentStep !== "overview") return;

        pinToTop({ status: "info" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Write and call your API</p>
                <p className="text-muted-foreground mt-1">
                    In this tutorial you'll write your first API, learn about built units, deploy to stage,
                    and call it with the built-in HTTP client.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Let's go!</SpotlightPrimaryActionButton>,
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, goNext);
    }, [currentStep, goNext]);

    useDebouncedEffect(
        () => {
            if (currentStep !== "choose-project") return;

            if (!appState.isMainSidebarOpen) {
                const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                    ? scrollWindowByWhenSettled({ top: -10 })
                    : undefined;

                setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);

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
                }
            }

            if (appState.isProjectSwitchDropdownOpen) {
                clearTutorialSpotlight();

                return listenAppEvent(events.PROJECT_SELECTED_EVENT, (event) => {
                    mergeTutorialMetadata({
                        projectId: event.detail.projectId,
                        projectTitle: event.detail.projectTitle,
                    });
                    goNext();
                });
            }

            setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Choose your project</p>
                    <p className="text-muted-foreground mt-1">
                        Use this button to switch projects. Open the menu and select the project you created in
                        the previous tutorial.
                    </p>
                </>,
            );
        },
        [currentStep, goNext, mergeTutorialMetadata, appState.isBreadcrumbStickyVisible, appState.isMainSidebarOpen, appState.isProjectSwitchDropdownOpen],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "develop-button") return;

            const isSubrouteOfProjectShell = isSubRouteOfPage(appState.pathname, ActivePage.PROJECT_SHELL);

            if (!isSubrouteOfProjectShell) {
                goTo("choose-project");
                return;
            }

            const { projectId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }

            if (!appState.isMainSidebarOpen) {
                const cancelPendingScroll = !appState.isBreadcrumbStickyVisible
                    ? scrollWindowByWhenSettled({ top: -10 })
                    : undefined;

                setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);

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
                }
            }

            setTargetSpotlightOverlayElementId(APP_DEVELOP_BUTTON_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Open the develop chat</p>
                    <p className="text-muted-foreground mt-1">
                        Click the Develop button to open the chat where you'll ask AI to write your first API.
                    </p>
                </>,
            );

            return listenAppEvent(events.DEVELOP_BUTTON_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            mergeTutorialMetadata,
            appState.isBreadcrumbStickyVisible,
            appState.isMainSidebarOpen,
            appState.isProjectSwitchDropdownOpen,
            appState.pathname,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "chat-composer-input") return;

            if (appState.activePage !== ActivePage.NEW_CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }

            setTargetSpotlightOverlayElementId(APP_CHAT_COMPOSER_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-muted-foreground mt-1">
                        Send this message to ask AI to write your first API. When AI is done, we'll come back to
                        go ahead and deploy the to stage runtime.
                    </p>
                    <blockquote className="my-4 border-l-2 border-muted pl-3 text-sm text-muted-foreground">
                        {TUTORIAL_HELLO_WORLD_PROMPT}
                    </blockquote>
                </>,
                <Button
                    type="button"
                    variant="default"
                    size="xs"
                    className={"ml-auto"}
                    onClick={() => {
                        triggerAppEvent(events.CHAT_COMPOSER_FILL_PROMPT_EVENT, { text: TUTORIAL_HELLO_WORLD_PROMPT });
                    }}
                >
                    Fill the prompt
                </Button>,
            );

            return listenAppEvent(events.CHAT_SESSION_CREATED_EVENT, (event) => {
                mergeTutorialMetadata({
                    chatSessionId: event.detail.chatSessionId,
                });
                goNext();
            });
        },
        [
            currentStep,
            goNext,
            goTo,
            mergeTutorialMetadata,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "waiting-for-unit-creation") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            clearTutorialSpotlight();

            return listenAppEvent(events.CREATE_UNIT_RECEIVED_EVENT, (event) => {
                const unitChatSessionId = event.detail.payload?.created_unit?.chat_session_id;

                if (unitChatSessionId !== chatSessionId) {
                    return;
                }

                mergeTutorialMetadata({
                    firstUnitId: event.detail.payload?.created_unit?.id,
                });
                goNext();
            });
        },
        [
            currentStep,
            goNext,
            goTo,
            mergeTutorialMetadata,
            appState.pathParams,
            appState.activePage,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "copy-unit-id") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            setTargetSpotlightOverlayElementId(`tutorial-first-unit-id-badge-${firstUnitId}`, { placement: "top" });
            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Copy the unit ID</p>
                    <p className="text-muted-foreground mt-1">
                        This is the ID of the unit just created.
                        Click on the unit ID badge to copy it. You'll need this ID to filter units later.
                    </p>
                </>,
            );

            return listenAppEvent(events.UNIT_ID_BADGE_COPIED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "open-unit-changes-modal") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            setTargetSpotlightOverlayElementId(`tutorial-first-unit-card-${firstUnitId}`, { placement: "top" });
            setSpotlightContentToRender(
                <>
                    <p className="font-medium">View your new unit</p>
                    <p className="text-muted-foreground mt-1">
                        Click the unit card to open its changes view. Review the details, then close the modal to continue.
                        <br />
                        You don't need to do anything in this modal. Just see what it contains, then close it.
                    </p>
                </>,
            );

            return listenAppEvent(events.UNIT_CHANGES_MODAL_OPENED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "review-unit-changes-modal") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            const modalElement = document.getElementById(APP_UNIT_CHANGES_MODAL_ID);

            if (modalElement === null) {
                goTo("open-unit-changes-modal");
                return;
            }

            clearTutorialSpotlight();

            return listenAppEvent(events.UNIT_CHANGES_MODAL_CLOSED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "deploy-to-stage") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            assignLastReleaseControllerStageButtonSpotlightId();

            setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Deploy to stage</p>
                    <p className="text-muted-foreground mt-1">
                        Click the latest release button at the bottom to open the deploy modal.
                    </p>
                </>,
            );

            return listenAppEvent(events.STAGE_DEPLOY_MODAL_OPENED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "choose-stage-runtime") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            const modalElement = document.getElementById(APP_STAGE_DEPLOY_MODAL_ID);

            if (modalElement === null) {
                goTo("deploy-to-stage");
                return;
            }

            setTargetSpotlightOverlayElementId(APP_STAGE_DEPLOY_MODAL_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Choose a stage runtime</p>
                    <p className="text-muted-foreground mt-1">
                        Pick a stage runtime and deploy your release. You can deploy to an idle runtime or swap an
                        existing live release.
                    </p>
                </>,
            );

            return listenAppEvent(events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT, (event) => {
                mergeTutorialMetadata({
                    stageRuntimeId: event.detail,
                });
                goNext();
            });
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "open-release-page") return;

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("develop-button");
                return;
            }

            const { projectId, chatSessionId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("develop-button");
                return;
            }

            assignLastReleaseControllerStageReleaseLinkSpotlightId();

            setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Open the release page</p>
                    <p className="text-muted-foreground mt-1">
                        Click again on the stage release badge to open the release page and inspect your deployed units.
                    </p>
                </>,
            );

            return listenAppEvent(events.STAGE_RELEASE_BADGE_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "filter-unit-by-id") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            setTargetSpotlightOverlayElementId(APP_RELEASE_UNITS_FILTER_INPUT_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Filter units by ID</p>
                    <p className="text-muted-foreground mt-1">
                        You can filter units by their ID using this input. Use the button below to fill the ID we
                        copied earlier or paste it manually.
                    </p>
                </>,
                <Button
                    type="button"
                    variant="default"
                    size="xs"
                    className={"ml-auto"}
                    onClick={() => {
                        triggerAppEvent(events.RELEASE_UNITS_FILTER_FILL_UNIT_ID_EVENT, { unitId: firstUnitId });
                    }}
                >
                    Fill unit ID
                </Button>
            );

            return listenAppEvent(events.RELEASE_UNITS_FILTER_APPLIED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "call-unit-live-interaction") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            const unitsPaths = appState.searchParams.units_paths ?? [];

            if (!unitsPaths.includes(firstUnitId)) {
                goTo("filter-unit-by-id");
                return;
            }

            setTargetSpotlightOverlayElementId(tutorialFirstUnitLiveInteractionButtonId(firstUnitId));

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Expand live interaction section</p>
                    <p className="text-muted-foreground mt-1">
                        Click Live interaction to open the built-in client to continue.
                    </p>
                </>,
            );

            return listenAppEvent(events.UNIT_LIVE_INTERACTION_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            appState.searchParams,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "start-scalar-http-client") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            const unitsPaths = appState.searchParams.units_paths ?? [];

            if (!unitsPaths.includes(firstUnitId)) {
                goTo("filter-unit-by-id");
                return;
            }

            if (!appState.liveInteractionOpenUnitIds.includes(firstUnitId)) {
                goTo("call-unit-live-interaction");
                return;
            }

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarTestRequestButtonId(firstUnitId));

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Open the HTTP client modal</p>
                    <p className="text-muted-foreground mt-1">
                        Click Test Request to open the built-in client modal.
                    </p>
                </>,
            );

            return listenAppEvent(events.SCALAR_TEST_REQUEST_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            appState.searchParams,
            appState.liveInteractionOpenUnitIds,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "send-scalar-http-request") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            const unitsPaths = appState.searchParams.units_paths ?? [];

            if (!unitsPaths.includes(firstUnitId)) {
                goTo("filter-unit-by-id");
                return;
            }

            if (appState.scalarClientModalOpenUnitId !== firstUnitId) {
                goTo("start-scalar-http-client");
                return;
            }

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarSendButtonId(firstUnitId));

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Send your request</p>
                    <p className="text-muted-foreground mt-1">
                        Click Send to call your API and get the response.
                    </p>
                </>,
            );

            return listenAppEvent(events.SCALAR_SEND_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            appState.searchParams,
            appState.scalarClientModalOpenUnitId,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "copy-scalar-trace-id") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            const unitsPaths = appState.searchParams.units_paths ?? [];

            if (!unitsPaths.includes(firstUnitId)) {
                goTo("filter-unit-by-id");
                return;
            }

            if (appState.scalarClientModalOpenUnitId !== firstUnitId) {
                goTo("start-scalar-http-client");
                return;
            }

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarResponseHeadersButtonId(firstUnitId));

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Response headers</p>
                    <p className="text-muted-foreground mt-1">
                        Here are the response headers from your call.
                        <br />
                        The value of{" "}
                        <code className="text-foreground">X-Trace-Id</code> header will be used for debugging in
                        later tutorials.
                    </p>
                </>,
                <SpotlightPrimaryActionButton>Got it</SpotlightPrimaryActionButton>,
            );

            return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            appState.searchParams,
            appState.scalarClientModalOpenUnitId,
            loadTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => {
            if (currentStep !== "review-scalar-response-body") return;

            if (appState.activePage !== ActivePage.RUNTIME_UNITS_RELEASES) {
                goTo("develop-button");
                return;
            }

            const { projectId, stageRuntimeId, firstUnitId } = await loadTutorialMetadata();

            if (appState.pathParams?.projectId !== projectId) {
                goTo("choose-project");
                return;
            }
            
            if (appState.pathParams?.runtimeId !== stageRuntimeId) {
                goTo("develop-button");
                return;
            }

            if (firstUnitId === undefined) {
                goTo("develop-button");
                return;
            }

            const unitsPaths = appState.searchParams.units_paths ?? [];

            if (!unitsPaths.includes(firstUnitId)) {
                goTo("filter-unit-by-id");
                return;
            }

            if (appState.scalarClientModalOpenUnitId !== firstUnitId) {
                goTo("start-scalar-http-client");
                return;
            }

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarResponseBodySectionId(firstUnitId));

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Response body</p>
                    <p className="text-muted-foreground mt-1">
                        This is the response from the API unit you just created.
                    </p>
                </>,
                <SpotlightPrimaryActionButton>Got it</SpotlightPrimaryActionButton>,
            );

            return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, () => {
                goNext();
                closeScalarClientModal();
            });
        },
        [
            currentStep,
            goNext,
            goTo,
            appState.activePage,
            appState.pathParams,
            appState.searchParams,
            appState.scalarClientModalOpenUnitId,
            loadTutorialMetadata,
        ],
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
