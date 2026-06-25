import { STORAGE_KEYS } from "@/constants/storage-keys";
import { SECONDARY_SIDEBAR_SHEET_BREAKPOINT, useIsBelowBreakpoint } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { secondarySidebarApi, secondarySidebarStore } from "@/stores/secondary-sidebar";
import { useStickyBreadcrumbBarHeight, useStickyBreadcrumbBarTransition, useStickyBreadcrumbBarVisible } from "@/stores/breadcrumb";
import React, { useCallback, useLayoutEffect, useMemo } from "react";
import { useStore } from "zustand";
import { SidebarChromeDismiss } from "@/components/sidebar-chrome-dismiss";
import { Sidebar, SidebarProvider } from "../ui/sidebar";
import { InternalSecondarySidebarContext } from "./context";

type Props = {
    children: React.ReactNode;
    storageKey?: STORAGE_KEYS;
    defaultOpen?: boolean;
};

function readStoredSecondarySidebarOpen(storageKey: STORAGE_KEYS | undefined, defaultOpen: boolean | undefined): boolean {
    if (storageKey != null) {
        return localStorage.getItem(storageKey) === "true";
    }
    return defaultOpen ?? false;
}

export function SecondarySidebarProvider({ children, storageKey, defaultOpen }: Props) {
    const isSheetViewport = useIsBelowBreakpoint(SECONDARY_SIDEBAR_SHEET_BREAKPOINT);
    const sidebarOpen = useStore(secondarySidebarStore, (state) => state.open);

    const persistOpen = useCallback(
        (open: boolean) => {
            if (storageKey != null) {
                localStorage.setItem(storageKey, String(open));
            }
        },
        [storageKey],
    );

    useLayoutEffect(() => {
        const initialOpen = readStoredSecondarySidebarOpen(storageKey, defaultOpen);
        secondarySidebarStore.getState().setOpen(initialOpen, { persist: false });

        return () => {
            secondarySidebarStore.getState().reset();
        };
    }, [storageKey, defaultOpen]);

    const handleOpenChangeSkipStorage = useCallback((open: boolean) => {
        secondarySidebarStore.getState().setOpen(open, { persist: false });
    }, []);

    const rereadSidebarOpen = useCallback(() => {
        const open = readStoredSecondarySidebarOpen(storageKey, defaultOpen);
        secondarySidebarStore.getState().setOpen(open, { persist: false });
    }, [storageKey, defaultOpen]);

    useLayoutEffect(() => {
        const unsubscribe = secondarySidebarStore.subscribe((state, previousState) => {
            if (state.open === previousState.open) return;
            if (state.isMobile) return;
            persistOpen(state.open);
        });

        return unsubscribe;
    }, [persistOpen]);

    const contextValue = useMemo(
        () => ({
            handleOpenChangeSkipStorage,
            rereadSidebarOpen,
        }),
        [handleOpenChangeSkipStorage, rereadSidebarOpen],
    );

    return (
        <InternalSecondarySidebarContext.Provider value={contextValue}>
            <SidebarProvider
                sidebarStore={secondarySidebarApi}
                mobileBreakpoint={SECONDARY_SIDEBAR_SHEET_BREAKPOINT}
                className={cn(
                    "flex-col min-w-0 transition-width duration-200 min-h-none",
                    isSheetViewport || !sidebarOpen ? "w-full" : "w-[calc(100%-var(--sidebar-width))]",
                )}
            >
                <SidebarChromeDismiss />
                {children}
            </SidebarProvider>
        </InternalSecondarySidebarContext.Provider>
    );
}

export function SecondarySidebar({ children }: Props) {
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();

    return (
        <Sidebar
            side="right"
            className={cn(
                "z-20",
                stickyBarVisible
                    ? // Match viewport below sticky bar: h-svh + offset top would extend past the screen and clip the scroll area.
                      `top-[var(--sticky-bar-height)] h-[calc(100svh-var(--sticky-bar-height))]`
                    : "top-0",
                "transition-all",
                stickyBarTransition,
            )}
            style={{
                ["--sticky-bar-height" as keyof React.CSSProperties]: `${stickyBarHeight}px`,
                ...stickyBarTransitionStyles,
            }}
        >
            {children}
        </Sidebar>
    );
}
