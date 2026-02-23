"use client";

import { ChevronRight, Settings, Bot, List, MessageSquareText, Box, ServerCrash } from "lucide-react";
import { Link, useParams, useLocation } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { FancyButton } from "@/components/fancy-button";
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
  const { open, isMobile } = useSidebar();
  const isCollapsed = !open;
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

  const unitsReleasesUrl = `/dashboard/projects/${projectId}/units-releases`;
  const isUnitsReleasesActive = pathname.startsWith(unitsReleasesUrl);

  const runtimesUrl = `/dashboard/projects/${projectId}/runtimes`;
  const isRuntimesActive = pathname.startsWith(runtimesUrl);

  return (
    <>
      <ChatSessionsListModal />
      <SidebarGroup>
      <SidebarGroupLabel>{project.name} Area</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem className="my-2">
          <SidebarMenuButton asChild tooltip="Develop by AI">
            <FancyButton size="xs" asChild className="rounded-full">
              <Link to={conversationsUrl}>
                <Bot className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Develope by AI</span>
              </Link>
            </FancyButton>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          {isCollapsed ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                {visibleSessions.length > 0 ? (
                  <SidebarMenuButton tooltip="Previous conversations">
                    <MessageSquareText />
                    <span>Previous conversations</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex w-full cursor-not-allowed">
                        <SidebarMenuButton disabled>
                          <MessageSquareText />
                          <span>No conversations yet</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      No conversations yet
                    </TooltipContent>
                  </Tooltip>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="start"
                sideOffset={8}
                className="min-w-48 max-h-60 overflow-y-auto"
              >
                <DropdownMenuLabel>Previous conversations</DropdownMenuLabel>
                {visibleSessions.map((chatSession) => {
                  const url = `/dashboard/projects/${projectId}/conversations/${chatSession.id}`;
                  const isActive = `${pathname}/`.startsWith(`${url}/`);
                  return (
                    <DropdownMenuItem key={chatSession.id} asChild>
                      <Link
                        to={url}
                        className={isActive ? "bg-accent" : undefined}
                      >
                        {chatSession.title}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                {hasMore && (
                  <DropdownMenuItem
                    onClick={() =>
                      projectId != null && openChatSessionsModal(projectId)
                    }
                    className="text-muted-foreground"
                  >
                    <List className="size-4" />
                    Show all sessions
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {visibleSessions.length > 0 ? (
                <SidebarMenuButton asChild tooltip="Previous conversations">
                  <div>
                    <MessageSquareText />
                    <span>Previous conversations</span>
                  </div>
                </SidebarMenuButton>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex w-full cursor-not-allowed">
                      <SidebarMenuButton disabled>
                        <MessageSquareText />
                        <span>No conversations yet</span>
                      </SidebarMenuButton>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    No conversations yet
                  </TooltipContent>
                </Tooltip>
              )}
              <SidebarMenuSub className="max-h-60 overflow-y-auto">
                {visibleSessions.map((chatSession) => {
                  const url = `/dashboard/projects/${projectId}/conversations/${chatSession.id}`;

                  // The trailing slash is important to match the end of the pathname correctly
                  // Otherwise, /conversations/1 will match to /conversations/10
                  const isActive = `${pathname}/`.startsWith(`${url}/`);

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
            </>
          )}
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isUnitsReleasesActive} tooltip="Units & Releases">
            <Link to={unitsReleasesUrl}>
              <Box />
              <span>Units & Releases</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isRuntimesActive} tooltip="Runtimes">
            <Link to={runtimesUrl}>
              <ServerCrash />
              <span>Runtimes</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isSettingsActive} tooltip="Settings">
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
