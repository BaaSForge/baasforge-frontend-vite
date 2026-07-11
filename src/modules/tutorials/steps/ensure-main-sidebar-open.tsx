import { APP_SIDEBAR_TOGGLE_BUTTON_ID } from "@/modules/layout/components/sticky-breadcrumb-bar";
import { setTargetSpotlightOverlayElementId } from "@/components/target-spotlight-overlay";
import { events, listenAppEvent } from "@/services/events";
import { breadcrumbStore } from "@/stores/breadcrumb";
import { isMainSidebarClosed } from "@/stores/main-sidebar";
import type { StepContext, StoredStepData } from "./types";

type EnsureMainSidebarOpenContent = {
    title: string;
    description: string;
};

type EnsureMainSidebarOpenOptions = {
    keepStickyBarVisible?: boolean;
};

export async function ensureMainSidebarOpen<TData extends StoredStepData>(
    ctx: StepContext<TData>,
    content: EnsureMainSidebarOpenContent,
    options?: EnsureMainSidebarOpenOptions,
): Promise<void> {
    setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);

    let lastSidebarClosed: boolean | null = null;

    const syncSpotlightWithSidebar = () => {
        const sidebarClosed = isMainSidebarClosed();
        if (sidebarClosed === lastSidebarClosed) return;
        lastSidebarClosed = sidebarClosed;

        if (sidebarClosed) {
            ctx.setSpotlightContent(
                <>
                    <p className="font-medium">{content.title}</p>
                    <p className="text-muted-foreground mt-1">{content.description}</p>
                </>,
            );
        } else {
            ctx.clearSpotlightContent();
        }
    };

    const cleanups = [
        listenAppEvent(events.MAIN_SIDEBAR_OPENED_EVENT, syncSpotlightWithSidebar),
        listenAppEvent(events.MAIN_SIDEBAR_CLOSED_EVENT, syncSpotlightWithSidebar),
    ];

    try {
        syncSpotlightWithSidebar();

        while (isMainSidebarClosed()) {
            if (options?.keepStickyBarVisible && !breadcrumbStore.getState().stickyBarVisible) {
                window.scrollBy({ top: -10 });
            }
            await ctx.race(ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT), ctx.sleep(1000));
            syncSpotlightWithSidebar();
        }
    } finally {
        for (const cleanup of cleanups) {
            cleanup();
        }
    }
}

export async function simplyEnsureMainSidebarOpen<TData extends StoredStepData>(
    ctx: StepContext<TData>,
    content: EnsureMainSidebarOpenContent,
    options?: EnsureMainSidebarOpenOptions,
): Promise<void> {
    const sidebarClosed = isMainSidebarClosed();

    if (!sidebarClosed) {
        return;
    }

    if (options?.keepStickyBarVisible && !breadcrumbStore.getState().stickyBarVisible) {
        window.scrollBy({ top: -10 });
    }

    setTargetSpotlightOverlayElementId(APP_SIDEBAR_TOGGLE_BUTTON_ID);

    ctx.setSpotlightContent(
        <>
            <p className="font-medium">{content.title}</p>
            <p className="text-muted-foreground mt-1">{content.description}</p>
        </>,
    );

    await ctx.once(events.MAIN_SIDEBAR_OPENED_EVENT);
}
