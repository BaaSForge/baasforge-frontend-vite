"use client";

import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { type AppState, appStateStore } from "./store";
import { useSyncAppState } from "./use-sync-app-state";

export function useAppState(): AppState {
    useSyncAppState();

    return useStore(
        appStateStore,
        useShallow((state) => ({
            isMobile: state.isMobile,
            isMainSidebarOpen: state.isMainSidebarOpen,
            isSecondarySidebarOpen: state.isSecondarySidebarOpen,
            isAnyModalOpen: state.isAnyModalOpen,
            isAnyAlertOpen: state.isAnyAlertOpen,
            activePage: state.activePage,
            pathParams: state.pathParams,
            isNotificationDropdownOpen: state.isNotificationDropdownOpen,
            isThemeSwitchDropdownOpen: state.isThemeSwitchDropdownOpen,
            isProjectSwitchDropdownOpen: state.isProjectSwitchDropdownOpen,
            isUserMenuDropdownOpen: state.isUserMenuDropdownOpen,
            isBreadcrumbStickyVisible: state.isBreadcrumbStickyVisible,
        })),
    );
}
