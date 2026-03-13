"use client";

import { useEffect } from "react";
import { ChevronRight, Settings, Bot, MessageSquareText, Box, ServerCrash } from "lucide-react";
import { Link, useParams, useLocation } from "react-router";

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
import {
  SHORTCUT_LABELS,
  UNIFIED_KEYBOARD_SCOPES,
  register,
  unregister,
} from "@/lib/unified-keyboard";
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
  const { open } = useSidebar();
  const isCollapsed = !open;
  const projectId = projectIdParam != null ? Number(projectIdParam) : undefined;
  const { data: project } = useProjectQuery(projectId);
  const { data: chatSessions } = useProjectChatSessionsQuery(projectId ?? 0);
  const [openChatSessionsModal] = useChatSessionsModal();

  useEffect(() => {
    if (projectId == null) return;
    const openModal = () => openChatSessionsModal(projectId);
    register(UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS, openModal);
    return () => unregister(UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS);
  }, [projectId, openChatSessionsModal]);

  const visibleSessions = (chatSessions ?? []).slice(0, VISIBLE_CHAT_SESSIONS_COUNT);

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
          <SidebarMenuButton
            asChild
            tooltip={`Develop by AI (${SHORTCUT_LABELS.NEW_CONVERSATION})`}
          >
            <FancyButton size="xs" asChild className="rounded-full">
              <Link to={conversationsUrl}>
                <Bot className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Develop by AI
                  <span className="text-xs ml-2">
                    ({SHORTCUT_LABELS.NEW_CONVERSATION})
                  </span>
                </span>
              </Link>
            </FancyButton>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          {visibleSessions.length > 0 ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() =>
                      projectId != null && openChatSessionsModal(projectId)
                    }
                  >
                    <MessageSquareText />
                    <span>Previous conversations</span>
                    <ChevronRight
                      className="ml-auto size-4 shrink-0 opacity-70 pointer-events-none transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      aria-hidden
                    />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {isCollapsed
                    ? `Previous conversations (${SHORTCUT_LABELS.OPEN_PREVIOUS_CONVERSATIONS})`
                    : SHORTCUT_LABELS.OPEN_PREVIOUS_CONVERSATIONS}
                </TooltipContent>
              </Tooltip>
              {!isCollapsed && (
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
                </SidebarMenuSub>
              )}
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex w-full cursor-not-allowed">
                  <SidebarMenuButton disabled>
                    <MessageSquareText />
                    <span>No conversations yet</span>
                    {isCollapsed && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                No conversations yet
              </TooltipContent>
            </Tooltip>
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
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
    </>
  );
}
