import { breadcrumbStore } from "@/stores/breadcrumb";
import { isSidebarOpen } from "@/stores/create-sidebar-store";
import { mainSidebarStore } from "@/stores/main-sidebar";
import { secondarySidebarStore } from "@/stores/secondary-sidebar";
import { createStore } from "zustand";

import { ActivePage } from "./pages";
import { resolveActivePage, type PathParams, type RouteState } from "./resolve-active-page";

export type AppState = {
    isMobile: boolean;
    isMainSidebarOpen: boolean;
    isSecondarySidebarOpen: boolean;
    isAnyModalOpen: boolean;
    isAnyAlertOpen: boolean;
    activePage: (typeof ActivePage)[keyof typeof ActivePage];
    pathParams: PathParams;
    isNotificationDropdownOpen: boolean;
    isThemeSwitchDropdownOpen: boolean;
    isProjectSwitchDropdownOpen: boolean;
    isUserMenuDropdownOpen: boolean;
    isBreadcrumbStickyVisible: boolean;
};

type AppStateActions = {
    syncFromMainSidebar: () => void;
    syncFromSecondarySidebar: () => void;
    syncFromBreadcrumb: () => void;
    syncRoute: (pathname: string) => void;
    setNotificationDropdownOpen: (open: boolean) => void;
    setThemeSwitchDropdownOpen: (open: boolean) => void;
    setProjectSwitchDropdownOpen: (open: boolean) => void;
    setUserMenuDropdownOpen: (open: boolean) => void;
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

function routeStateEqual(a: RouteState, b: RouteState): boolean {
    if (a.activePage !== b.activePage) return false;
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
    activePage: ActivePage.UNKNOWN,
    pathParams: {},
    isNotificationDropdownOpen: false,
    isThemeSwitchDropdownOpen: false,
    isProjectSwitchDropdownOpen: false,
    isUserMenuDropdownOpen: false,
    isBreadcrumbStickyVisible: true,
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
    syncRoute: (pathname) => {
        const next = resolveActivePage(pathname);
        const state = get();
        if (routeStateEqual({ activePage: state.activePage, pathParams: state.pathParams }, next)) return;
        set({ activePage: next.activePage, pathParams: next.pathParams });
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
}));
