import { useShallow } from "zustand/react/shallow";
import { createStore, useStore, type StoreApi } from "zustand";

export type SidebarSnapshot = {
    isMobile: boolean;
    open: boolean;
    openMobile: boolean;
};

export type SidebarStoreOptions = {
    defaultOpen: boolean;
    onDesktopOpenChange?: (open: boolean) => void;
    onToggle?: (nextOpen: boolean, isMobile: boolean) => void;
};

type SetOpenOptions = {
    persist?: boolean;
};

type SidebarState = SidebarSnapshot & {
    setIsMobile: (isMobile: boolean) => void;
    setOpen: (open: boolean, options?: SetOpenOptions) => void;
    setOpenMobile: (open: boolean) => void;
    toggleSidebar: () => void;
    reset: () => void;
};

export type SidebarStore = StoreApi<SidebarState>;

export type SidebarStoreApi = ReturnType<typeof createSidebarStore>;

export function isSidebarOpen({ isMobile, open, openMobile }: SidebarSnapshot): boolean {
    return isMobile ? openMobile : open;
}

export function createSidebarStore(options: SidebarStoreOptions) {
    const defaultSnapshot: SidebarSnapshot = {
        isMobile: false,
        open: options.defaultOpen,
        openMobile: false,
    };

    const store = createStore<SidebarState>((set, get) => ({
        ...defaultSnapshot,
        setIsMobile: (isMobile) => {
            if (get().isMobile === isMobile) return;
            set({ isMobile });
        },
        setOpen: (open, setOpenOptions) => {
            if (get().open === open) return;
            set({ open });
            if (setOpenOptions?.persist !== false && !get().isMobile) {
                options.onDesktopOpenChange?.(open);
            }
        },
        setOpenMobile: (openMobile) => {
            if (get().openMobile === openMobile) return;
            set({ openMobile });
        },
        toggleSidebar: () => {
            const { isMobile, open, openMobile } = get();
            if (isMobile) {
                const nextOpen = !openMobile;
                options.onToggle?.(nextOpen, true);
                set({ openMobile: nextOpen });
                return;
            }

            const nextOpen = !open;
            options.onToggle?.(nextOpen, false);
            set({ open: nextOpen });
            options.onDesktopOpenChange?.(nextOpen);
        },
        reset: () => set({ ...defaultSnapshot }),
    }));

    function getSnapshot(): SidebarSnapshot {
        const { isMobile, open, openMobile } = store.getState();
        return { isMobile, open, openMobile };
    }

    function isOpen(): boolean {
        return isSidebarOpen(getSnapshot());
    }

    function isClosed(): boolean {
        return !isOpen();
    }

    function closeIfMobile(): void {
        const state = store.getState();
        if (!state.isMobile || !state.openMobile) return;
        options.onToggle?.(false, true);
        state.setOpenMobile(false);
    }

    function useSidebar() {
        return useStore(
            store,
            useShallow((state) => ({
                state: state.open ? ("expanded" as const) : ("collapsed" as const),
                open: state.open,
                setOpen: state.setOpen,
                openMobile: state.openMobile,
                setOpenMobile: state.setOpenMobile,
                isMobile: state.isMobile,
                toggleSidebar: state.toggleSidebar,
            })),
        );
    }

    function useVisibility() {
        return useStore(
            store,
            useShallow((state) => {
                const snapshot = {
                    isMobile: state.isMobile,
                    open: state.open,
                    openMobile: state.openMobile,
                };
                const openState = isSidebarOpen(snapshot);

                return {
                    ...snapshot,
                    isOpen: openState,
                    isClosed: !openState,
                };
            }),
        );
    }

    return {
        store,
        isOpen,
        isClosed,
        closeIfMobile,
        useSidebar,
        useVisibility,
        getSnapshot,
    };
}
