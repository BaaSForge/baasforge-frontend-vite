"use client";

import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { type AppState, appStateStore, effectiveSidebarDropdownOpen } from "./store";
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
            isProjectSwitchDropdownOpen: effectiveSidebarDropdownOpen(state.isProjectSwitchDropdownOpen, state),
            isUserMenuDropdownOpen: effectiveSidebarDropdownOpen(state.isUserMenuDropdownOpen, state),
            isBreadcrumbStickyVisible: state.isBreadcrumbStickyVisible,
        })),
    );
}
