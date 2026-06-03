import { STORAGE_KEYS } from "@/constants/storage-keys";
import { SECONDARY_SIDEBAR_SHEET_BREAKPOINT, useIsBelowBreakpoint } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useStickyBreadcrumbBarHeight, useStickyBreadcrumbBarTransition, useStickyBreadcrumbBarVisible } from "@/stores/breadcrumb";
import React, { useCallback, useMemo, useState } from "react";
import { Sidebar, SidebarProvider } from "../ui/sidebar";
import { InternalSecondarySidebarContext } from "./context";

type Props = {
    children: React.ReactNode;
    storageKey?: STORAGE_KEYS;
    defaultOpen?: boolean;
};

export function SecondarySidebarProvider({ children, storageKey, defaultOpen }: Props) {
    const defaultValue = storageKey ? localStorage.getItem(storageKey) === "true" : defaultOpen;

    const isSheetViewport = useIsBelowBreakpoint(SECONDARY_SIDEBAR_SHEET_BREAKPOINT);
    const [sidebarOpen, setSidebarOpen] = useState(defaultValue);

    const handleOpenChange = (open: boolean) => {
        setSidebarOpen(open);
        if (storageKey) {
            localStorage.setItem(storageKey, String(open));
        }
    };

    const handleOpenChangeSkipStorage = useCallback((open: boolean) => {
        setSidebarOpen(open);
    }, []);

    const rereadSidebarOpen = useCallback(() => {
        const value = storageKey ? localStorage.getItem(storageKey) === "true" : defaultOpen;
        setSidebarOpen(value);
    }, [storageKey, defaultOpen]);

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
                open={sidebarOpen}
                onOpenChange={handleOpenChange}
                mobileBreakpoint={SECONDARY_SIDEBAR_SHEET_BREAKPOINT}
                className={cn(
                    "flex-col min-w-0 transition-width duration-200 min-h-none",
                    isSheetViewport || !sidebarOpen ? "w-full" : "w-[calc(100%-var(--sidebar-width))]",
                )}
            >
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
