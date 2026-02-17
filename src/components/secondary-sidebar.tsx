import React, { useState, createContext, useContext, useCallback, useMemo } from "react";
import {
  SidebarProvider,
  useSidebar,
  SidebarContent,
  Sidebar,
  SidebarInset,
} from "./ui/sidebar";
import { cn } from "@/lib/utils";
import {
  useStickyBreadcrumbBarHeight,
  useStickyBreadcrumbBarTransition,
  useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import { STORAGE_KEYS } from "@/constants/storage-keys";

type Props = {
  children: React.ReactNode;
  storageKey?: STORAGE_KEYS;
  defaultOpen?: boolean;
};

type InternalSecondarySidebarContextValue = {
  handleOpenChangeSkipStorage: (open: boolean) => void;
  rereadSidebarOpen: () => void;
};
const InternalSecondarySidebarContext = createContext<InternalSecondarySidebarContextValue | undefined>(undefined);

export function SecondarySidebarProvider({
  children,
  storageKey,
  defaultOpen,
}: Props) {
  const defaultValue = storageKey
    ? localStorage.getItem(storageKey) === "true"
    : defaultOpen;

  const mainSidebar = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(defaultValue);

  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    if (storageKey) {
      localStorage.setItem(storageKey, String(open));
    }
  };

  const handleOpenChangeSkipStorage = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  const rereadSidebarOpen = useCallback(() => {
    const value = storageKey ? localStorage.getItem(storageKey) === "true" : defaultOpen;
    setSidebarOpen(value);
  }, [storageKey, defaultOpen]);

  const { isMobile } = mainSidebar;
  const sidebarClassName =
    isMobile || !sidebarOpen
      ? "w-full"
      : "w-[calc(100%-var(--sidebar-width))]";

  const contextValue = useMemo(() => ({
    handleOpenChangeSkipStorage,
    rereadSidebarOpen,
  }), [handleOpenChangeSkipStorage, rereadSidebarOpen]);

  return (
    <InternalSecondarySidebarContext.Provider value={contextValue}>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={handleOpenChange}
        className={cn(
          "flex-col",
          "transition-width duration-200",
          "min-h-none",
          sidebarClassName
        )}
      >
        {children}
      </SidebarProvider>
    </InternalSecondarySidebarContext.Provider>
  );
}

export function SecondarySidebar({ children }: Props) {
  const stickyBarVisible = useStickyBreadcrumbBarVisible();
  const stickyBarHeight = useStickyBreadcrumbBarHeight();
  const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } =
    useStickyBreadcrumbBarTransition();

  return (
    <Sidebar
      side="right"
      className={cn(
        stickyBarVisible ? `top-[var(--sticky-bar-height)]` : "top-0",
        "transition-all",
        stickyBarTransition
      )}
      style={{
        ["--sticky-bar-height" as any]: `${stickyBarHeight}px`,
        ...stickyBarTransitionStyles,
      }}
    >
      {children}
    </Sidebar>
  );
}

export function useSecondarySidebar() {
  const { toggleSidebar } = useSidebar();
  const ctx = useContext(InternalSecondarySidebarContext);

  return {
    toggleSidebar,
    setOpenSkipStorage: ctx?.handleOpenChangeSkipStorage!,
    rereadSidebarOpen: ctx?.rereadSidebarOpen!,
  };
}

export { SidebarContent, SidebarInset, useSidebar };