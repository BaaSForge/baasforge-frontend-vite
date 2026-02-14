"use client";

import {
  ChevronsUpDown,
  Plus,
  Check,
  Package,
  MousePointerClick,
} from "lucide-react";
import { useLocation, useParams, Link } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProjectQuery, useProjectsQuery } from "@/modules/project/queries";
import { getSwitchProjectLink } from "@/modules/project/libs";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();

  const params = useParams();
  const location = useLocation();

  const projectIdParam = params.projectId;
  const projectId = projectIdParam != null ? Number(projectIdParam) : undefined;
  const { data: activeProject } = useProjectQuery(projectId);
  const { data: projects } = useProjectsQuery();

  const hasActiveProject = !!activeProject?.id;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border bg-card"
            >
              <div
                className={
                  cn(
                    "bg-sidebar-secondary text-sidebar-secondary-foreground flex",
                    "aspect-square size-8 items-center justify-center rounded-lg",
                    hasActiveProject && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )
                }
              >
                {hasActiveProject ? (
                  <Package className="size-4" />
                ) : (
                  <MousePointerClick className="size-4 opacity-60" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {hasActiveProject ? (
                  <>
                    <span className="truncate font-medium">
                      {activeProject?.name}
                    </span>
                    <span className="truncate text-xs">
                      {activeProject?.slug}
                    </span>
                  </>
                ) : (
                  <span className="truncate font-medium text-muted-foreground">
                    Select a project here
                  </span>
                )}
              </div>
              {hasActiveProject && <ChevronsUpDown className="ml-auto" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Projects
            </DropdownMenuLabel>
            {projects?.map((project) => {
              const linkObj = getSwitchProjectLink(location, params, project.id);
              const isActive = project.id === activeProject?.id;
              return (
                <DropdownMenuItem
                  asChild
                  key={project.name}
                  className={`gap-2 p-2 ${isActive ? "bg-accent/60 text-accent-foreground font-semibold" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <Link to={linkObj.pathname + linkObj.search}>
                    <div className={`flex size-6 items-center justify-center rounded-md border ${isActive ? "border-accent bg-accent/30" : ""}`}>
                      <Package className="size-4" />
                    </div>
                    {project.name}
                    {isActive && (
                      <Check className="ml-auto size-4 text-accent-foreground" />
                    )}
                    {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link to="/dashboard/projects/new">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add project
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}