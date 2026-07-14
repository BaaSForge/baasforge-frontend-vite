"use client";

import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { pinToTop, setTargetSpotlightOverlayElementId, SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { setSpotlightContentToRender } from "@/components/target-spotlight-overlay/lib/spotlight-renderer";
import { ActivePage, useAppState } from "@/modules/app-state";
import { useLoadTutorialMetadata, useTutorialSteps } from "@/modules/tutorials/hooks/use-tutorial-steps";
import { events, listenAppEvent } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import { scrollWindowByWhenSettled } from "@/lib/dom";
import { useCallback, useEffect } from "react";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { clearTutorialSpotlight } from "../../hooks/use-tutorial-stop-listener";
import { isSubRouteOfPage } from "@/pages/routes";
import { APP_RUNTIMES_MENU_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_LAST_RELEASE_CONTROLLER_PROD_BUTTON_ID, assignLastReleaseControllerProdButtonSpotlightId } from "@/pages/dashboard/projects/[projectId]/conversations/components/message/release-controller-tutorial-targets";
import type { WriteAndCallExtra } from "../2.write-and-call-your-api";
import { TUTORIAL_ID as WRITE_AND_CALL_TUTORIAL_ID } from "../2.write-and-call-your-api";
import { getRuntimeCardChatSessionButtonId } from "@/components/runtime-card";

type DebugAndReleaseExtra = never;

const LAYOUT_SETTLE_DEBOUNCE_MS = 250;

const TUTORIAL_ID = "debug-and-release" as const;

const STEPS = [
    "overview",
    "choose-previous-tutorial-project",
    "open-runtimes-page",
    "open-runtime-chat-session",
    "deploy-to-production",
    "done",
] as const;

export function DebugAndReleaseTutorial() {
    const appState = useAppState();
    const loadWriteAndCallTutorialMetadata = useLoadTutorialMetadata<WriteAndCallExtra>(
        WELCOME_TUTORIALS_GROUP_ID, WRITE_AND_CALL_TUTORIAL_ID,
    );
    const { currentStep, goNext, goTo, loadTutorialMetadata, goToInterrupted } = useTutorialSteps<
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
        async () => {
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
        async () => {
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

            setTargetSpotlightOverlayElementId(APP_RUNTIMES_MENU_BUTTON_ID);

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
        async () => {
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
        async () => {
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
            appState.activePage,
            appState.pathParams,
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
