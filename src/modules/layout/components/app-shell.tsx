import * as React from "react";
import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  StickyBreadcrumbBar,
  StickyBreadcrumbBarPlaceholder,
} from "./sticky-breadcrumb-bar";
import { AppSidebar } from "./app-sidebar";

const SIDEBAR_STORAGE_KEY = "sidebar_state";

function getStoredSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function AppShell() {
  const [open, setOpen] = React.useState(getStoredSidebarState);

  const handleOpenChange = React.useCallback((value: boolean) => {
    setOpen(value);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <AppSidebar />
      <SidebarInset>
        <StickyBreadcrumbBarPlaceholder />
        <StickyBreadcrumbBar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
