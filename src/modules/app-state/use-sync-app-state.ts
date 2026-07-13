"use client";

import { breadcrumbStore } from "@/stores/breadcrumb";
import { mainSidebarStore } from "@/stores/main-sidebar";
import { secondarySidebarStore } from "@/stores/secondary-sidebar";
import { useEffect } from "react";
import { useLocation, useMatches, useParams } from "react-router";

import { resolveRouteStateFromMatches, type PathParams } from "./resolve-active-page";
import { appStateStore } from "./store";

function normalizeParams(params: Record<string, string | undefined>): PathParams {
    const normalized: PathParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (value != null) normalized[key] = value;
    }
    return normalized;
}

export function useSyncAppState(): void {
    const { pathname, search } = useLocation();
    const matches = useMatches();
    const params = useParams();

    useEffect(() => {
        appStateStore
            .getState()
            .syncRoute(resolveRouteStateFromMatches(matches, normalizeParams(params), pathname, search));
    }, [pathname, search, matches, params]);

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
