"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { ActivePage, useAppState } from "@/modules/app-state";
import { useLoadTutorialMetadata, useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent, triggerAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import { scrollWindowByWhenSettled } from "@/lib/dom";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { clearTutorialSpotlight } from "../../hooks/use-tutorial-stop-listener";
import { isSubRouteOfPage } from "@/pages/routes";
import { APP_RUNTIMES_MENU_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_LAST_RELEASE_CONTROLLER_PROD_BUTTON_ID, APP_LAST_RELEASE_CONTROLLER_PROD_RELEASE_LINK_ID, assignLastReleaseControllerProdButtonSpotlightId, assignLastReleaseControllerProdReleaseLinkSpotlightId } from "@/pages/dashboard/projects/[projectId]/conversations/components/message/release-controller-tutorial-targets";
import type { WriteAndCallExtra } from "../2.write-and-call-your-api";
import { TUTORIAL_ID as WRITE_AND_CALL_TUTORIAL_ID } from "../2.write-and-call-your-api";
import { getRuntimeCardChatSessionButtonId } from "@/components/runtime-card";
import { APP_RELEASE_UNITS_FILTER_INPUT_ID } from "@/modules/project/release-units-all/release-units-all-panel";
import { tutorialFirstUnitLiveInteractionButtonId, tutorialFirstUnitScalarResponseHeadersButtonId, tutorialFirstUnitScalarSendButtonId, tutorialFirstUnitScalarTestRequestButtonId } from "./tutorial-target-ids";

type DebugAndReleaseExtra = never;

const LAYOUT_SETTLE_DEBOUNCE_MS = 250;

const TUTORIAL_ID = "debug-and-release" as const;

const STEPS = [
    "overview",
    "choose-previous-tutorial-project",
    "open-runtimes-page",
    "open-runtime-chat-session",
    "deploy-to-production",
    "go-to-production",
    "filter-unit-by-id",
    "call-unit-live-interaction",
    "start-scalar-http-client",
    "send-scalar-http-request",
    "copy-scalar-trace-id",
    "done",
] as const;

export function DebugAndReleaseTutorial() {
    const appState = useAppState();
    const loadWriteAndCallTutorialMetadata = useLoadTutorialMetadata<WriteAndCallExtra>(
        WELCOME_TUTORIALS_GROUP_ID, WRITE_AND_CALL_TUTORIAL_ID,
    );
    const { currentStep, goNext, goTo, goToInterrupted } = useTutorialSteps<
        typeof STEPS,
        DebugAndReleaseExtra
    >(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID, STEPS);

    const isInPreviousProject = useCallback(async () => {
        const writeAndCallMetadata = await loadWriteAndCallTutorialMetadata();
        const isSubrouteOfProjectShell = isSubRouteOfPage(appState.pathname, ActivePage.PROJECT_SHELL);
        const isPreviousProjectId = appState.pathParams?.projectId === writeAndCallMetadata.projectId;

        return isSubrouteOfProjectShell && isPreviousProjectId;
    }, [loadWriteAndCallTutorialMetadata, appState.pathname, appState.pathParams]);

    useEffect(() => {
        if (currentStep !== "overview") return;

        pinToTop({ status: "info" });
        setSpotlightContentToRender(
            <>
                <p className="font-medium">Debug and release</p>
                <p className="text-muted-foreground mt-1">
                    You'll release your units to production, call them live, and use trace IDs to debug
                    issues. Then you'll ask AI to update your units then redeploy through stage and production.
                </p>
            </>,
            <SpotlightPrimaryActionButton>Let's go!</SpotlightPrimaryActionButton>,
        );

        return listenAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED, goNext);
    }, [currentStep, goNext]);

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "choose-previous-tutorial-project") return;

            const isPreviousProject = await isInPreviousProject();

            if (isPreviousProject) {
                goNext();
                return;
            }

            const writeAndCallMetadata = await loadWriteAndCallTutorialMetadata();

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
                    if (event.detail.projectId === writeAndCallMetadata.projectId) {
                        goNext();
                    }
                });
            }

            const previousProjectTitle = writeAndCallMetadata.projectTitle;

            setTargetSpotlightOverlayElementId(APP_PROJECTS_MENU_BUTTON_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Choose project `{previousProjectTitle}`</p>
                    <p className="text-muted-foreground mt-1">
                        Use this button to switch projects. Open the menu and select the project `{previousProjectTitle}` you used in previous tutorials to create your first API unit.
                    </p>
                </>,
            );
        },
        [
            currentStep,
            goNext,
            loadWriteAndCallTutorialMetadata,
            isInPreviousProject,
            appState.isBreadcrumbStickyVisible,
            appState.isMainSidebarOpen,
            appState.isProjectSwitchDropdownOpen,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "open-runtimes-page") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
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

            setTargetSpotlightOverlayElementId(APP_RUNTIMES_MENU_BUTTON_ID, { zIndexLayout: 'layout' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Open runtimes page</p>
                    <p className="text-muted-foreground mt-1">
                        Use this button to open runtimes list page to navigate to the runtime you already released for stage on previous tutorial.
                    </p>
                </>,
            );

            return listenAppEvent(events.RUNTIMES_MENU_BUTTON_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            isInPreviousProject,
            appState.isBreadcrumbStickyVisible,
            appState.isMainSidebarOpen,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "open-runtime-chat-session") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.RUNTIMES) {
                goTo("open-runtimes-page");
                return;
            }

            const writeAndCallMetadata = await loadWriteAndCallTutorialMetadata();

            if (!writeAndCallMetadata.chatSessionId || !writeAndCallMetadata.stageRuntimeId) {
                goToInterrupted();
                return;
            }

            const runtimeCardChatSessionButtonId = getRuntimeCardChatSessionButtonId({ chatSessionId: writeAndCallMetadata.chatSessionId, runtimeId: writeAndCallMetadata.stageRuntimeId });

            setTargetSpotlightOverlayElementId(runtimeCardChatSessionButtonId);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Go to the chat conversation</p>
                    <p className="text-muted-foreground mt-1">
                        Here is the stage runtime you just released your units there, by clicking on this button you will be navigated to the chat conversation that release was introduced in.
                    </p>
                </>,
            );

            return listenAppEvent(events.RUNTIME_CARD_CHAT_SESSION_BUTTON_CLICKED_EVENT, (event) => {
                const itsCorrectButton = event.detail.chatSessionId === writeAndCallMetadata.chatSessionId && event.detail.runtimeId === writeAndCallMetadata.stageRuntimeId;
                if (!itsCorrectButton) {
                    return;
                }

                goNext();
            });
        },
        [
            currentStep,
            goNext,
            goTo,
            isInPreviousProject,
            goToInterrupted,
            loadWriteAndCallTutorialMetadata,
            appState.activePage,
            appState.isBreadcrumbStickyVisible,
            appState.isMainSidebarOpen,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "deploy-to-production") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { chatSessionId } = await loadWriteAndCallTutorialMetadata();

            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("open-runtime-chat-session");
                return;
            }

            assignLastReleaseControllerProdReleaseLinkSpotlightId();

            const linkElement = document.getElementById(APP_LAST_RELEASE_CONTROLLER_PROD_RELEASE_LINK_ID);

            if (linkElement) {
                goNext();
                return;
            }

            assignLastReleaseControllerProdButtonSpotlightId();
            setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_PROD_BUTTON_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Deploy to production</p>
                    <p className="text-muted-foreground mt-1">
                        Click the latest release button at the bottom to deploy to the production, note production release is only avaiable when you have released to the stage earlier.
                    </p>
                </>,
            );

            return listenAppEvent(events.PROD_DEPLOY_DONE_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            isInPreviousProject,
            loadWriteAndCallTutorialMetadata,
            appState.activePage,
            appState.pathParams,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "go-to-production") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.CHAT) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { chatSessionId } = await loadWriteAndCallTutorialMetadata();

            if (appState.pathParams?.conversationId !== chatSessionId) {
                goTo("open-runtime-chat-session");
                return;
            }

            assignLastReleaseControllerProdReleaseLinkSpotlightId();
            setTargetSpotlightOverlayElementId(APP_LAST_RELEASE_CONTROLLER_PROD_RELEASE_LINK_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Open the production release page</p>
                    <p className="text-muted-foreground mt-1">
                        Click again on the production release badge to open the release page and inspect your deployed units.
                    </p>
                </>,
            );

            return listenAppEvent(events.PROD_RELEASE_BADGE_CLICKED_EVENT, goNext);
        },
        [
            currentStep,
            goNext,
            goTo,
            isInPreviousProject,
            loadWriteAndCallTutorialMetadata,
            appState.activePage,
            appState.pathParams,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "filter-unit-by-id") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.UNITS_RELEASES_DETAIL) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { firstUnitId } = await loadWriteAndCallTutorialMetadata();

            if (firstUnitId === undefined) {
                goToInterrupted();
                return;
            }

            setTargetSpotlightOverlayElementId(APP_RELEASE_UNITS_FILTER_INPUT_ID);

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Filter units by ID</p>
                    <p className="text-muted-foreground mt-1">
                        Filter units by it's ID using this input. Use the button below to fill the ID we
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
            isInPreviousProject,
            appState.activePage,
            goToInterrupted,
            loadWriteAndCallTutorialMetadata,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "call-unit-live-interaction") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.UNITS_RELEASES_DETAIL) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { firstUnitId } = await loadWriteAndCallTutorialMetadata();

            if (firstUnitId === undefined) {
                goToInterrupted();
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
            loadWriteAndCallTutorialMetadata,
            goToInterrupted,
            isInPreviousProject,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "start-scalar-http-client") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.UNITS_RELEASES_DETAIL) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { firstUnitId } = await loadWriteAndCallTutorialMetadata();

            if (firstUnitId === undefined) {
                goToInterrupted();
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
            loadWriteAndCallTutorialMetadata,
            goToInterrupted,
            isInPreviousProject,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "send-scalar-http-request") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.UNITS_RELEASES_DETAIL) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { firstUnitId } = await loadWriteAndCallTutorialMetadata();

            if (firstUnitId === undefined) {
                goToInterrupted();
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

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarSendButtonId(firstUnitId), { zIndexLayout: 'toast' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Send your request</p>
                    <p className="text-muted-foreground mt-1">
                        Click Send to call your API and get the response. This is the production call, it will return the trace ID too.
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
            loadWriteAndCallTutorialMetadata,
            goToInterrupted,
            isInPreviousProject,
        ],
        LAYOUT_SETTLE_DEBOUNCE_MS,
    );

    useDebouncedEffect(
        async () => { // eslint-disable-line react-hooks/exhaustive-deps
            if (currentStep !== "copy-scalar-trace-id") return;

            const isPreviousProject = await isInPreviousProject();

            if (!isPreviousProject) {
                goTo("choose-previous-tutorial-project");
                return;
            }

            if (appState.activePage !== ActivePage.UNITS_RELEASES_DETAIL) {
                goTo("open-runtime-chat-session");
                return;
            }

            const { firstUnitId } = await loadWriteAndCallTutorialMetadata();

            if (firstUnitId === undefined) {
                goToInterrupted();
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

            setTargetSpotlightOverlayElementId(tutorialFirstUnitScalarResponseHeadersButtonId(firstUnitId), { zIndexLayout: 'toast' });

            setSpotlightContentToRender(
                <>
                    <p className="font-medium">Response headers</p>
                    <p className="text-muted-foreground mt-1">
                        Here are the response headers from your call.
                        <br />
                        Copy the value of{" "}
                        <code className="text-foreground">X-Trace-Id</code> header to debug this trace.
                    </p>
                </>,
                <SpotlightPrimaryActionButton>Copied it.</SpotlightPrimaryActionButton>,
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
            loadWriteAndCallTutorialMetadata,
            goToInterrupted,
            isInPreviousProject,
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
