"use client";

import * as React from "react";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { ProjectSwitcher } from "./project-switcher";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    onOpenShortcuts: () => void;
};

export function AppSidebar({ onOpenShortcuts, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <ProjectSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <FadedScrollArea className="flex-1 min-h-0 max-h-full" faderFromClassName="from-sidebar">
                    <div className="flex flex-col gap-2">
                        <NavProjects />
                        <NavMain />
                    </div>
                </FadedScrollArea>
            </SidebarContent>
            <SidebarFooter>
                <NavUser onOpenShortcuts={onOpenShortcuts} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
