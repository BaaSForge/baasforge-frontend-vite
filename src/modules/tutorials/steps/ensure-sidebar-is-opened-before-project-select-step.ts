import { ensureMainSidebarOpen } from "./ensure-main-sidebar-open";
import type { StepContext, StepDefinition, StoredStepData } from "./types";

export const ENSURE_SIDEBAR_IS_OPENED_BEFORE_PROJECT_SELECT_STEP_ID =
    "ensure-sidebar-is-opened-before-project-select" as const;

export async function runEnsureSidebarIsOpenedBeforeProjectSelectStep<TData extends StoredStepData>(
    ctx: StepContext<TData>,
): Promise<void> {
    await ensureMainSidebarOpen(
        ctx,
        {
            title: "Expand the sidebar to continue",
            description: "Use this button to open the sidebar and continue with the tutorial.",
        },
        { keepStickyBarVisible: true },
    );

    void ctx.next({});
}

export function createEnsureSidebarIsOpenedBeforeProjectSelectStep<
    TData extends StoredStepData,
>(): StepDefinition<TData> {
    return {
        id: ENSURE_SIDEBAR_IS_OPENED_BEFORE_PROJECT_SELECT_STEP_ID,
        handler: (ctx) => runEnsureSidebarIsOpenedBeforeProjectSelectStep(ctx),
    };
}
