"use client";

import { SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { APP_RUNTIMES_MENU_BUTTON_ID } from "@/modules/layout/components/nav-projects";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { TutorialRunner, type TutorialDefinition } from "@/modules/tutorials/engine";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { isMainSidebarClosed, isMainSidebarOpen, mainSidebarStore } from "@/stores/main-sidebar";
import { useEffect, useState } from "react";
import {
    getWriteAndCallTutorialStageRuntimeId,
    tutorialRuntimeCardSelector,
} from "./get-write-and-call-tutorial-stage-runtime-id";

type DebugAndReleaseExtra = {
    projectId: string;
    stageRuntimeId: string;
};

const OPEN_SIDEBAR_REPAIR_ID = "open-sidebar";

// const currentProjectId = (): Partial<DebugAndReleaseExtra> | void => {
//     const projectId = getSelectedProjectIdFromPathname(window.location.pathname);
//     if (projectId) return { projectId };
// };

function createDefinition(stageRuntimeId: string | null): TutorialDefinition<DebugAndReleaseExtra> {
    return {
        tutorialGroupId: WELCOME_TUTORIALS_GROUP_ID,
        tutorialId: "debug-and-release",
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
                        <p className="font-medium">Debug and release</p>
                        <p className="text-muted-foreground mt-1">
                            You'll release your units to production, call them live, and use trace IDs to debug
                            issues. Then you'll ask AI to update your units, redeploy through stage and production,
                            and review production history to learn how to roll back.
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
                // isDone: () => isProjectSelectedUrl(window.location.pathname),
                // onComplete: currentProjectId,
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
                id: "go-to-runtimes",
                target: { elementId: APP_RUNTIMES_MENU_BUTTON_ID },
                // requires: () => isMainSidebarOpen() && isProjectSelectedUrl(window.location.pathname),
                fallback: "choose-project",
                keepStickyBarVisible: true,
                completeOn: events.RUNTIMES_PAGE_MOUNTED_EVENT,
                // isDone: () => isProjectRuntimesListUrl(window.location.pathname),
                content: (
                    <>
                        <p className="font-medium">Open Runtimes</p>
                        <p className="text-muted-foreground mt-1">
                            Click Runtimes in the sidebar to see where your units run in stage or production.
                        </p>
                    </>
                ),
            },
            {
                id: "review-stage-runtime",
                target: stageRuntimeId ? { selector: tutorialRuntimeCardSelector(stageRuntimeId) } : { hidden: true },
                // requires: () => isProjectRuntimesListUrl(window.location.pathname) && stageRuntimeId != null,
                fallback: "go-to-runtimes",
                completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
                content: (
                    <>
                        <p className="font-medium">Your stage runtime</p>
                        <p className="text-muted-foreground mt-1">
                            This is the stage runtime you deployed to in the previous tutorial. Your units run here
                            before you promote them to production.
                        </p>
                    </>
                ),
                actions: <SpotlightPrimaryActionButton>Got it</SpotlightPrimaryActionButton>,
                graceMs: 10000,
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
}

export function DebugAndReleaseTutorial() {
    const [stageRuntimeId, setStageRuntimeId] = useState<string | null>(null);

    useEffect(() => {
        void getWriteAndCallTutorialStageRuntimeId().then((id) => {
            if (id) setStageRuntimeId(id);
        });
    }, []);

    const definition = createDefinition(stageRuntimeId);
    return <TutorialRunner key={stageRuntimeId ?? "loading"} definition={definition} />;
}

