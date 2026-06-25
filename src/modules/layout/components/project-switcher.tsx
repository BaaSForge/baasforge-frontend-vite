"use client";

import { Check, ChevronsUpDown, Package, Plus } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getSwitchProjectLink } from "@/modules/project/libs";
import { useProjectQuery, useProjectsQuery } from "@/modules/project/queries";
import { events, triggerAppEvent } from "@/services/events";
import { AppLogoSquare } from "@/components/logo/app-logo-square";

export const APP_PROJECTS_MENU_BUTTON_ID = "app-projects-menu-button";

export function ProjectSwitcher() {
    const { isMobile } = useSidebar();

    const params = useParams();
    const location = useLocation();

    const projectIdParam = params.projectId;
    const projectIdOrUndefined = projectIdParam ?? undefined;
    const { data: activeProject } = useProjectQuery(projectIdOrUndefined);
    const { data: projects } = useProjectsQuery();

    const hasActiveProject = !!activeProject?.id;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu
                    modal={false}
                    onOpenChange={(open) => {
                        if (open) {
                            triggerAppEvent(events.PROJECT_SWITCH_MENU_OPENED_EVENT);
                        }
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            id={APP_PROJECTS_MENU_BUTTON_ID}
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border bg-card"
                        >
                            <div
                                className={cn(
                                    "text-sidebar-secondary-foreground flex",
                                    "aspect-square size-8 items-center justify-center rounded-lg",
                                    hasActiveProject && "text-sidebar-primary-foreground",
                                )}
                            >
                                <AppLogoSquare className={hasActiveProject ? "size-7" : "size-6"} grayscale={!hasActiveProject} />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                {hasActiveProject ? (
                                    <>
                                        <span className="truncate font-medium">{activeProject?.name}</span>
                                        <span className="truncate text-xs">{activeProject?.slug}</span>
                                    </>
                                ) : (
                                    <span className="truncate font-medium text-muted-foreground">Select a project here</span>
                                )}
                            </div>
                            {hasActiveProject && <ChevronsUpDown className="ml-auto" />}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="flex w-(--radix-dropdown-menu-trigger-width) min-w-56 flex-col overflow-hidden rounded-lg p-1"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground shrink-0 text-xs">Projects</DropdownMenuLabel>
                        <FadedScrollArea boundedVertical className="max-h-[16.5rem] w-full" faderFromClassName="from-popover">
                            <div>
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
                                                <div
                                                    className={`flex size-6 items-center justify-center rounded-md border ${isActive ? "border-accent bg-accent/30" : ""}`}
                                                >
                                                    <Package className="size-4" />
                                                </div>
                                                {project.name}
                                                {isActive && <Check className="ml-auto size-4 text-accent-foreground" />}
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </div>
                        </FadedScrollArea>
                        <DropdownMenuSeparator className="shrink-0" />
                        <DropdownMenuItem asChild className="shrink-0 gap-2 p-2">
                            <Link
                                to="/dashboard/projects/new"
                                onClick={() => triggerAppEvent(events.PROJECT_CREATE_BUTTON_CLICKED_EVENT)}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <Plus className="size-4" />
                                </div>
                                <div className="text-muted-foreground font-medium">Add project</div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
