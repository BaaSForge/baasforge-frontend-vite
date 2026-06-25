import { events, triggerAppEvent } from "@/services/events";
import { createSidebarStore } from "./create-sidebar-store";

const SIDEBAR_STORAGE_KEY = "sidebar_state";
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function readStoredMainSidebarOpen(): boolean {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === null ? true : stored === "true";
}

const mainSidebar = createSidebarStore({
    defaultOpen: true,
    onDesktopOpenChange: (open) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    onToggle: (nextOpen) => {
        triggerAppEvent(nextOpen ? events.MAIN_SIDEBAR_OPENED_EVENT : events.MAIN_SIDEBAR_CLOSED_EVENT);
    },
});

if (typeof window !== "undefined") {
    mainSidebar.store.getState().setOpen(readStoredMainSidebarOpen(), { persist: false });
}

export const mainSidebarStore = mainSidebar.store;
export const mainSidebarApi = mainSidebar;

export const isMainSidebarOpen = mainSidebar.isOpen;
export const isMainSidebarClosed = mainSidebar.isClosed;
export const closeMainSidebarIfMobile = mainSidebar.closeIfMobile;
export const useMainSidebar = mainSidebar.useSidebar;
export const useMainSidebarVisibility = mainSidebar.useVisibility;
