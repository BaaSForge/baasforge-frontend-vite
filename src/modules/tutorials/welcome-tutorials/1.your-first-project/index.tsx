"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID } from "@/components/app-notification-inbox-button";
import { APP_THEME_SWITCHER_BUTTON_ID } from "@/components/mode-toggle";
import { SpotlightPrimaryActionButton } from "@/components/target-spotlight-overlay";
import { emitSignupTutorialOpen } from "@/components/signup-tutorial-nudge";
import { APP_USER_MENU_BUTTON_ID } from "@/modules/layout/components/nav-user";
import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { TutorialRunner, type TutorialDefinition } from "@/modules/tutorials/engine";
import { APP_CREATE_PROJECT_FORM_ID } from "@/pages/dashboard/projects/new/page";
import { events } from "@/services/events";
import { WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { isMainSidebarOpen, mainSidebarStore } from "@/stores/main-sidebar";

type YourFirstProjectExtra = {
    projectId: string;
};

const OPEN_SIDEBAR_REPAIR_ID = "open-sidebar";

const definition: TutorialDefinition<YourFirstProjectExtra> = {
    tutorialGroupId: WELCOME_TUTORIALS_GROUP_ID,
    tutorialId: "your-first-project",
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
                    <p className="font-medium">Let's tour the dashboard</p>
                    <p className="text-muted-foreground mt-1">
                        Before we create a project, let's learn a bit about the dashboard. Then we'll create your
                        first project.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
        },
        {
            id: "inbox",
            target: { elementId: APP_NOTIFICATION_INBOX_BUTTON_ID },
            keepStickyBarVisible: true,
            completeOn: events.NOTIFICATION_CLOSED_EVENT,
            content: (
                <>
                    <p className="font-medium">Your inbox</p>
                    <p className="text-muted-foreground mt-1">
                        This is your inbox. You can find all tutorials here later. Try clicking it to see what's
                        inside, then close the inbox to proceed with the tutorial.
                    </p>
                </>
            ),
        },
        {
            id: "theme-switch",
            target: { elementId: APP_THEME_SWITCHER_BUTTON_ID },
            keepStickyBarVisible: true,
            completeOn: events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED,
            content: (
                <>
                    <p className="font-medium">Personalize your theme</p>
                    <p className="text-muted-foreground mt-1">
                        You can switch the app's theme here. Click the button multiple times to toggle between
                        available themes. By default, the theme follows your system setting.
                    </p>
                </>
            ),
            actions: <SpotlightPrimaryActionButton>Got it!</SpotlightPrimaryActionButton>,
        },
        {
            id: "user-menu",
            target: { elementId: APP_USER_MENU_BUTTON_ID },
            requires: isMainSidebarOpen,
            fallback: OPEN_SIDEBAR_REPAIR_ID,
            keepStickyBarVisible: true,
            completeOn: events.USER_MENU_CLOSED_EVENT,
            content: (
                <>
                    <p className="font-medium">Your account menu</p>
                    <p className="text-muted-foreground mt-1">
                        Open the user menu to see your profile and settings. Close it to proceed with the
                        tutorial.
                    </p>
                </>
            ),
        },
        {
            id: "projects-switch-menu",
            target: { elementId: APP_PROJECTS_MENU_BUTTON_ID },
            requires: isMainSidebarOpen,
            fallback: OPEN_SIDEBAR_REPAIR_ID,
            keepStickyBarVisible: true,
            completeOn: events.PROJECT_CREATE_BUTTON_CLICKED_EVENT,
            content: (
                <>
                    <p className="font-medium">Add a project</p>
                    <p className="text-muted-foreground mt-1">
                        Using this button you can switch between projects. Click it to see the list of projects,
                        then click on `Add project`.
                    </p>
                </>
            ),
        },
        {
            id: "project-create-form",
            target: { elementId: APP_CREATE_PROJECT_FORM_ID },
            fallback: "projects-switch-menu",
            completeOn: {
                event: events.PROJECT_CREATED_EVENT,
                assign: ({ projectId }) => ({ projectId }),
            },
            content: (
                <>
                    <p className="font-medium">Create your first project</p>
                    <p className="text-muted-foreground mt-1">
                        Fill in the form and click `Create project` when you're ready.
                    </p>
                </>
            ),
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

export function YourFirstProjectTutorial() {
    return <TutorialRunner definition={definition} />;
}
