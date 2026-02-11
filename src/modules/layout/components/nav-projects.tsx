"use client";

import { Settings } from "lucide-react";
import { Link } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // useSidebar,
} from "@/components/ui/sidebar";

const PROJECT_SETTINGS_ID = "1";

export function NavProjects() {
  // const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={`/dashboard/projects/${PROJECT_SETTINGS_ID}/settings`}>
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem>
                <Folder className="text-muted-foreground" />
                <span>View Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Forward className="text-muted-foreground" />
                <span>Share Project</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="text-muted-foreground" />
                <span>Delete Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
