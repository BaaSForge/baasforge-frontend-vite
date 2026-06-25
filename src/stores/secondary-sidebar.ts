import { createSidebarStore } from "./create-sidebar-store";

const secondarySidebar = createSidebarStore({
    defaultOpen: false,
});

export const secondarySidebarStore = secondarySidebar.store;
export const secondarySidebarApi = secondarySidebar;

export const isSecondarySidebarOpen = secondarySidebar.isOpen;
export const isSecondarySidebarClosed = secondarySidebar.isClosed;
export const closeSecondarySidebarIfMobile = secondarySidebar.closeIfMobile;
export const useSecondarySidebar = secondarySidebar.useSidebar;
export const useSecondarySidebarVisibility = secondarySidebar.useVisibility;
