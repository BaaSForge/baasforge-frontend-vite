"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  Folder,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { ProjectSwitcher } from "./project-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const MAIN_NAV_ITEMS = [
  {
    title: "Projects",
    url: "#",
    icon: Folder,
    items: [
      { title: "List Projects", url: "/dashboard/projects" },
      { title: "Create Project", url: "/dashboard/projects/new" },
    ],
  },
  {
    title: "Account",
    url: "#",
    icon: Settings2,
    items: [
      { title: "Sessions", url: "/dashboard/tokens" },
    ],
  },
];

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects />
        <NavMain items={MAIN_NAV_ITEMS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
