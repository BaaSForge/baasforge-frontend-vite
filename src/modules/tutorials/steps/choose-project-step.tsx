import { APP_PROJECTS_MENU_BUTTON_ID } from "@/modules/layout/components/project-switcher";
import { setTargetSpotlightOverlayElementId } from "@/components/target-spotlight-overlay";
import { events } from "@/services/events";
import { isProjectSelectedUrl } from "@/services/routes";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import { ENSURE_SIDEBAR_IS_OPENED_BEFORE_PROJECT_SELECT_STEP_ID } from "./ensure-sidebar-is-opened-before-project-select-step";
import type { StepContext, StepDefinition, StoredStepData } from "./types";

export const CHOOSE_PROJECT_STEP_ID = "choose-project" as const;

export type ChooseProjectStepOptions = {
    onProjectAlreadySelectedStepId: string;
};

export async function runChooseProjectStep<TData extends StoredStepData>(
    ctx: StepContext<TData>,
    options: ChooseProjectStepOptions,
): Promise<void> {
    if (isProjectSelectedUrl(window.location.pathname)) {
        ctx.goTo(options.onProjectAlreadySelectedStepId);
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
                Use this button to switch projects. Open the menu and select the project you created in the previous
                tutorial.
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
        ctx.goTo(ENSURE_SIDEBAR_IS_OPENED_BEFORE_PROJECT_SELECT_STEP_ID);
        return;
    }

    void ctx.next({});
}

export function createChooseProjectStep<TData extends StoredStepData>(
    options: ChooseProjectStepOptions,
): StepDefinition<TData> {
    return {
        id: CHOOSE_PROJECT_STEP_ID,
        handler: (ctx) => runChooseProjectStep(ctx, options),
    };
}
