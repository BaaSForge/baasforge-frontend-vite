import * as React from "react";
import { Link, useLocation, useParams } from "react-router";
import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { useBreadcrumbSegmentLabels } from "@/stores/breadcrumb";
import { AppSidebar } from "./app-sidebar";

const SIDEBAR_STORAGE_KEY = "sidebar_state";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  settings: "Settings",
  info: "Info",
  delete: "Delete",
  runtimes: "Runtimes",
  clusters: "Clusters",
};

function getSegmentLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

function getStoredSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function AppShell() {
  const [open, setOpen] = React.useState(getStoredSidebarState);
  const { pathname } = useLocation();
  const params = useParams();
  const segments = pathname.split("/").filter(Boolean);
  const segmentLabels = useBreadcrumbSegmentLabels();

  const handleOpenChange = React.useCallback((value: boolean) => {
    setOpen(value);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  }, []);

  const getBreadcrumbLabel = React.useCallback(
    (segment: string): string => {
      for (const [paramName, paramValue] of Object.entries(params)) {
        if (paramValue === segment && segmentLabels[paramName]) {
          return segmentLabels[paramName];
        }
      }
      return getSegmentLabel(segment);
    },
    [params, segmentLabels]
  );

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {segments.map((segment, i) => {
                const path = "/" + segments.slice(0, i + 1).join("/");
                const label = getBreadcrumbLabel(segment);
                const isLast = i === segments.length - 1;
                return (
                  <React.Fragment key={path}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={path}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
