import { breadcrumbStore } from "@/stores/breadcrumb";
import { isSidebarOpen } from "@/stores/create-sidebar-store";
import { mainSidebarStore } from "@/stores/main-sidebar";
import { secondarySidebarStore } from "@/stores/secondary-sidebar";
import { createStore } from "zustand";

import { ActivePage } from "@/pages/routes";
import { type AppSearchParams, type PathParams, type RouteState } from "./resolve-active-page";

export type AppState = {
    isMobile: boolean;
    isMainSidebarOpen: boolean;
    isSecondarySidebarOpen: boolean;
    isAnyModalOpen: boolean;
    isAnyAlertOpen: boolean;
    isStageDeployModalOpen: boolean;
    activePage: (typeof ActivePage)[keyof typeof ActivePage];
    pathParams: PathParams;
    pathname: string;
    searchParams: AppSearchParams;
    isNotificationDropdownOpen: boolean;
    isThemeSwitchDropdownOpen: boolean;
    isProjectSwitchDropdownOpen: boolean;
    isUserMenuDropdownOpen: boolean;
    isBreadcrumbStickyVisible: boolean;
    liveInteractionOpenUnitIds: readonly string[];
    scalarClientModalOpenUnitId: string | null;
};

type AppStateActions = {
    syncFromMainSidebar: () => void;
    syncFromSecondarySidebar: () => void;
    syncFromBreadcrumb: () => void;
    syncRoute: (route: RouteState) => void;
    setNotificationDropdownOpen: (open: boolean) => void;
    setThemeSwitchDropdownOpen: (open: boolean) => void;
    setProjectSwitchDropdownOpen: (open: boolean) => void;
    setUserMenuDropdownOpen: (open: boolean) => void;
    setUnitLiveInteractionOpen: (unitId: string, open: boolean) => void;
    setScalarClientModalOpenUnitId: (unitId: string | null) => void;
    setStageDeployModalOpen: (open: boolean) => void;
};

export type AppStateStore = AppState & AppStateActions;

function readMainSidebarState(): Pick<AppState, "isMobile" | "isMainSidebarOpen"> {
    const { isMobile, open, openMobile } = mainSidebarStore.getState();
    return {
        isMobile,
        isMainSidebarOpen: isSidebarOpen({ isMobile, open, openMobile }),
    };
}

function readSecondarySidebarState(): Pick<AppState, "isSecondarySidebarOpen"> {
    const { isMobile, open, openMobile } = secondarySidebarStore.getState();
    return {
        isSecondarySidebarOpen: isSidebarOpen({ isMobile, open, openMobile }),
    };
}

function readBreadcrumbState(): Pick<AppState, "isBreadcrumbStickyVisible"> {
    return { isBreadcrumbStickyVisible: breadcrumbStore.getState().stickyBarVisible };
}

function closedSidebarDropdownState(): Pick<AppState, "isProjectSwitchDropdownOpen" | "isUserMenuDropdownOpen"> {
    return {
        isProjectSwitchDropdownOpen: false,
        isUserMenuDropdownOpen: false,
    };
}

function closedChromeDropdownState(): Pick<
    AppState,
    "isNotificationDropdownOpen" | "isThemeSwitchDropdownOpen" | "isProjectSwitchDropdownOpen" | "isUserMenuDropdownOpen"
> {
    return {
        ...closedSidebarDropdownState(),
        isNotificationDropdownOpen: false,
        isThemeSwitchDropdownOpen: false,
    };
}

function canSidebarHostOpenDropdowns(snapshot: Pick<AppState, "isMobile" | "isMainSidebarOpen">): boolean {
    if (!snapshot.isMobile) return true;
    return snapshot.isMainSidebarOpen;
}

export function effectiveSidebarDropdownOpen(
    storedOpen: boolean,
    snapshot: Pick<AppState, "isMobile" | "isMainSidebarOpen">,
): boolean {
    return storedOpen && canSidebarHostOpenDropdowns(snapshot);
}

export function isUnitLiveInteractionOpen(state: Pick<AppState, "liveInteractionOpenUnitIds">, unitId: string): boolean {
    return state.liveInteractionOpenUnitIds.includes(unitId);
}

export function isUnitScalarClientModalOpen(
    state: Pick<AppState, "scalarClientModalOpenUnitId">,
    unitId: string,
): boolean {
    return state.scalarClientModalOpenUnitId === unitId;
}

function searchParamsEqual(a: AppSearchParams, b: AppSearchParams): boolean {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key, index) => {
        if (key !== bKeys[index]) return false;
        const aValues = a[key];
        const bValues = b[key];
        if (aValues.length !== bValues.length) return false;
        return aValues.every((value, valueIndex) => value === bValues[valueIndex]);
    });
}

function routeStateEqual(a: RouteState, b: RouteState): boolean {
    if (a.activePage !== b.activePage || a.pathname !== b.pathname) return false;
    if (!searchParamsEqual(a.searchParams, b.searchParams)) return false;
    const aKeys = Object.keys(a.pathParams);
    const bKeys = Object.keys(b.pathParams);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => a.pathParams[key] === b.pathParams[key]);
}

export const appStateStore = createStore<AppStateStore>((set, get) => ({
    isMobile: false,
    isMainSidebarOpen: true,
    isSecondarySidebarOpen: false,
    isAnyModalOpen: false,
    isAnyAlertOpen: false,
    isStageDeployModalOpen: false,
    activePage: ActivePage.UNKNOWN,
    pathParams: {},
    pathname: "",
    searchParams: {},
    isNotificationDropdownOpen: false,
    isThemeSwitchDropdownOpen: false,
    isProjectSwitchDropdownOpen: false,
    isUserMenuDropdownOpen: false,
    isBreadcrumbStickyVisible: true,
    liveInteractionOpenUnitIds: [],
    scalarClientModalOpenUnitId: null,
    syncFromMainSidebar: () => {
        const next = readMainSidebarState();
        const state = get();
        const mobileChanged = state.isMobile !== next.isMobile;

        if (!mobileChanged && state.isMainSidebarOpen === next.isMainSidebarOpen) return;

        const patch: Partial<AppState> = { ...next };

        if (!canSidebarHostOpenDropdowns(next)) {
            Object.assign(patch, closedSidebarDropdownState());
        }
        if (mobileChanged) {
            Object.assign(patch, closedChromeDropdownState());
        }

        set(patch);
    },
    syncFromSecondarySidebar: () => {
        const next = readSecondarySidebarState();
        if (get().isSecondarySidebarOpen === next.isSecondarySidebarOpen) return;
        set(next);
    },
    syncFromBreadcrumb: () => {
        const next = readBreadcrumbState();
        if (get().isBreadcrumbStickyVisible === next.isBreadcrumbStickyVisible) return;
        set(next);
    },
    syncRoute: (next) => {
        const state = get();
        if (
            routeStateEqual(
                {
                    activePage: state.activePage,
                    pathParams: state.pathParams,
                    pathname: state.pathname,
                    searchParams: state.searchParams,
                },
                next,
            )
        ) {
            return;
        }
        set({
            activePage: next.activePage,
            pathParams: next.pathParams,
            pathname: next.pathname,
            searchParams: next.searchParams,
        });
    },
    setNotificationDropdownOpen: (open) => {
        if (get().isNotificationDropdownOpen === open) return;
        set({ isNotificationDropdownOpen: open });
    },
    setThemeSwitchDropdownOpen: (open) => {
        if (get().isThemeSwitchDropdownOpen === open) return;
        set({ isThemeSwitchDropdownOpen: open });
    },
    setProjectSwitchDropdownOpen: (open) => {
        const state = get();
        const nextOpen = effectiveSidebarDropdownOpen(open, state);
        if (state.isProjectSwitchDropdownOpen === nextOpen) return;
        set({ isProjectSwitchDropdownOpen: nextOpen });
    },
    setUserMenuDropdownOpen: (open) => {
        const state = get();
        const nextOpen = effectiveSidebarDropdownOpen(open, state);
        if (state.isUserMenuDropdownOpen === nextOpen) return;
        set({ isUserMenuDropdownOpen: nextOpen });
    },
    setUnitLiveInteractionOpen: (unitId, open) => {
        const state = get();
        const has = state.liveInteractionOpenUnitIds.includes(unitId);
        if (open === has) return;
        set({
            liveInteractionOpenUnitIds: open
                ? [...state.liveInteractionOpenUnitIds, unitId]
                : state.liveInteractionOpenUnitIds.filter((id) => id !== unitId),
        });
    },
    setScalarClientModalOpenUnitId: (unitId) => {
        if (get().scalarClientModalOpenUnitId === unitId) return;
        set({ scalarClientModalOpenUnitId: unitId });
    },
    setStageDeployModalOpen: (open) => {
        if (get().isStageDeployModalOpen === open) return;
        set({ isStageDeployModalOpen: open });
    },
}));
