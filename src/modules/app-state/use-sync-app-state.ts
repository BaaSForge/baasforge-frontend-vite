"use client";

import { breadcrumbStore } from "@/stores/breadcrumb";
import { mainSidebarStore } from "@/stores/main-sidebar";
import { secondarySidebarStore } from "@/stores/secondary-sidebar";
import { useEffect } from "react";
import { useLocation } from "react-router";

import { appStateStore } from "./store";

export function useSyncAppState(): void {
    const { pathname } = useLocation();

    useEffect(() => {
        appStateStore.getState().syncRoute(pathname);
    }, [pathname]);

    useEffect(() => {
        const syncMain = () => appStateStore.getState().syncFromMainSidebar();
        const syncSecondary = () => appStateStore.getState().syncFromSecondarySidebar();
        const syncBreadcrumb = () => appStateStore.getState().syncFromBreadcrumb();

        syncMain();
        syncSecondary();
        syncBreadcrumb();

        const unsubscribeMain = mainSidebarStore.subscribe(syncMain);
        const unsubscribeSecondary = secondarySidebarStore.subscribe(syncSecondary);
        const unsubscribeBreadcrumb = breadcrumbStore.subscribe(syncBreadcrumb);

        return () => {
            unsubscribeMain();
            unsubscribeSecondary();
            unsubscribeBreadcrumb();
        };
    }, []);
}
