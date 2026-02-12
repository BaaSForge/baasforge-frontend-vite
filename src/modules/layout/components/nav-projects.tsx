"use client";

import { Settings, Bot, List } from "lucide-react";
import { Link, useParams, useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useProjectQuery } from "@/modules/project/queries";
import {
  useProjectChatSessionsQuery,
  useChatSessionsModal,
  ChatSessionsListModal,
} from "@/modules/project-chat";

const VISIBLE_CHAT_SESSIONS_COUNT = 5;

export function NavProjects() {
  const { projectId: projectIdParam } = useParams();
  const { pathname } = useLocation();
  const projectId = projectIdParam != null ? Number(projectIdParam) : undefined;
  const { data: project } = useProjectQuery(projectId);
  const { data: chatSessions } = useProjectChatSessionsQuery(projectId ?? 0);
  const [openChatSessionsModal] = useChatSessionsModal();

  const visibleSessions = (chatSessions ?? []).slice(0, VISIBLE_CHAT_SESSIONS_COUNT);
  const hasMore = (chatSessions?.length ?? 0) > VISIBLE_CHAT_SESSIONS_COUNT;

  if (!project) {
    return null;
  }

  const settingsUrl = `/dashboard/projects/${projectId}/settings`;
  const isSettingsActive = pathname.startsWith(settingsUrl);

  const conversationsUrl = `/dashboard/projects/${projectId}/conversations`;
  const isConversationsActive = pathname.startsWith(conversationsUrl);

  return (
    <>
      <ChatSessionsListModal />
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{project.name} Area</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isConversationsActive}>
            <Link to={conversationsUrl}>
              <Bot />
              <span>Develope by AI</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuSub className="max-h-60 overflow-y-auto">
            {visibleSessions.map((chatSession) => {
              const url = `/dashboard/projects/${projectId}/conversations/${chatSession.id}`;
              const isActive = pathname.startsWith(url);

              return (
                <SidebarMenuSubItem key={chatSession.id}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link to={url}>
                      <span>{chatSession.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
            {hasMore && (
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  onClick={() =>
                    projectId != null && openChatSessionsModal(projectId)
                  }
                  className="text-muted-foreground flex gap-2"
                >
                  <List className="size-4" />
                  <span>Show all sessions</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isSettingsActive}>
            <Link to={settingsUrl}>
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
    </>
  );
}
