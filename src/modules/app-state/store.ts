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
};

type AppStateActions = {
    syncFromMainSidebar: () => void;
    syncFromSecondarySidebar: () => void;
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
    syncFromMainSidebar: () => {
        const next = readMainSidebarState();
        const state = get();
        if (state.isMobile === next.isMobile && state.isMainSidebarOpen === next.isMainSidebarOpen) return;
        set(next);
    },
    syncFromSecondarySidebar: () => {
        const next = readSecondarySidebarState();
        if (get().isSecondarySidebarOpen === next.isSecondarySidebarOpen) return;
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
        if (get().isProjectSwitchDropdownOpen === open) return;
        set({ isProjectSwitchDropdownOpen: open });
    },
    setUserMenuDropdownOpen: (open) => {
        if (get().isUserMenuDropdownOpen === open) return;
        set({ isUserMenuDropdownOpen: open });
    },
}));
