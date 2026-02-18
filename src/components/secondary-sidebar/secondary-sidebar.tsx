import React, { useState, useCallback, useMemo } from "react";
import {
  SidebarProvider,
  useSidebar,
  Sidebar,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";
import {
  useStickyBreadcrumbBarHeight,
  useStickyBreadcrumbBarTransition,
  useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { InternalSecondarySidebarContext } from "./context";

type Props = {
  children: React.ReactNode;
  storageKey?: STORAGE_KEYS;
  defaultOpen?: boolean;
};

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
        ["--sticky-bar-height" as keyof React.CSSProperties]: `${stickyBarHeight}px`,
        ...stickyBarTransitionStyles,
      }}
    >
      {children}
    </Sidebar>
  );
}