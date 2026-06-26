"use client";

import { Bot, Box, Bug, ChevronRight, Gauge, KeyRound, MessageSquareText, ServerCrash, Settings } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router";

import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHORTCUT_LABELS, UNIFIED_KEYBOARD_SCOPES, register, unregister } from "@/lib/unified-keyboard";
import { ChatSessionsListModal, useChatSessionsModal, useProjectChatSessionsQuery } from "@/modules/project-chat";
import { useProjectQuery } from "@/modules/project/queries";
import { useStartDebugModal } from "./start-debug-modal";
import { debugToolbarActiveToneClassName } from "@/pages/dashboard/projects/[projectId]/conversations/conversation-debug";
import { events, triggerAppEvent } from "@/services/events";
import { closeMainSidebarIfMobile } from "@/stores/main-sidebar";
import { cn } from "@/lib/utils";

export const APP_DEVELOP_BUTTON_ID = "app-develop-button";

const VISIBLE_CHAT_SESSIONS_COUNT = 5;

export function NavProjects() {
    const { projectId } = useParams();
    const { pathname } = useLocation();
    const { open, isMobile } = useSidebar();
    const isCollapsed = !open && !isMobile;
    const projectIdOrUndefined = projectId ?? undefined;
    const { data: project } = useProjectQuery(projectIdOrUndefined);
    const { data: chatSessions } = useProjectChatSessionsQuery(projectIdOrUndefined);
    const [openChatSessionsModal] = useChatSessionsModal();
    const { open: openStartDebugModal } = useStartDebugModal();

    useEffect(() => {
        if (projectIdOrUndefined == null) return;
        const openModal = () => openChatSessionsModal(projectIdOrUndefined);
        register(UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS, openModal);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS);
    }, [projectIdOrUndefined, openChatSessionsModal]);

    const visibleSessions = (chatSessions ?? []).slice(0, VISIBLE_CHAT_SESSIONS_COUNT);

    if (!project) {
        return null;
    }

    const settingsUrl = `/dashboard/projects/${projectId ?? ""}/settings`;
    const isSettingsActive = pathname.startsWith(settingsUrl);

    const conversationsUrl = `/dashboard/projects/${projectId ?? ""}/conversations`;

    const unitsReleasesUrl = `/dashboard/projects/${projectId ?? ""}/units-releases`;
    const isUnitsReleasesActive = pathname.startsWith(unitsReleasesUrl);

    const runtimesUrl = `/dashboard/projects/${projectId ?? ""}/runtimes`;
    const isRuntimesActive = pathname.startsWith(runtimesUrl) && !pathname.includes("/runtime-env-vars");

    const runtimeEnvVarsUrl = `/dashboard/projects/${projectId ?? ""}/runtime-env-vars`;
    const isRuntimeEnvVarsActive = pathname.startsWith(runtimeEnvVarsUrl);

    const usageUrl = `/dashboard/projects/${projectId ?? ""}/usage`;
    const isUsageActive = pathname.startsWith(usageUrl);

    return (
        <>
            <ChatSessionsListModal />
            <SidebarGroup>
                <SidebarGroupLabel>{project.name} Area</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem className="my-2">
                        <div className={`flex w-full items-stretch ${isCollapsed ? "flex-col gap-1" : "gap-1 px-2"}`}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        asChild
                                        style={{ height: "2rem", minHeight: "2rem" }}
                                        className={cn(
                                            "min-w-0 flex-[1] border-0 shadow-none transition-[filter,colors]",
                                            "!bg-gradient-to-r !from-blue-500 !to-blue-700 text-white hover:!text-white",
                                            "hover:!from-blue-400 hover:!to-blue-600 hover:!bg-gradient-to-r",
                                            "[.dark-default_&]:!from-blue-800 [.dark-default_&]:!to-blue-950",
                                            "[.dark-default_&]:hover:!from-blue-700 [.dark-default_&]:hover:!to-blue-900",
                                            "[.dark-midnight_&]:!from-blue-600 [.dark-midnight_&]:!to-blue-800",
                                            "[.dark-midnight_&]:hover:!from-blue-500 [.dark-midnight_&]:hover:!to-blue-700",
                                            "ring-1 ring-blue-500/20 [.dark-default_&]:ring-blue-300/18 [.dark-midnight_&]:ring-blue-300/22",
                                            "focus-visible:ring-2 focus-visible:ring-blue-500/35",
                                            isCollapsed ? "px-0" : "",
                                            isCollapsed ? "rounded-t-lg rounded-b-none" : "rounded-l-lg rounded-r-none",
                                        )}
                                    >
                                        <Link
                                            id={APP_DEVELOP_BUTTON_ID}
                                            to={conversationsUrl}
                                            onClick={() => {
                                                triggerAppEvent(events.DEVELOP_BUTTON_CLICKED_EVENT);
                                                closeMainSidebarIfMobile();
                                            }}
                                        >
                                            <Bot className="size-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">Develop</span>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" align="center">
                                        Develop
                                    </TooltipContent>
                                )}
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        style={{ height: "2rem", minHeight: "2rem" }}
                                        className={cn(
                                            "min-w-0 flex-[1]",
                                            debugToolbarActiveToneClassName,
                                            isCollapsed ? "px-0" : "",
                                            isCollapsed ? "rounded-t-none rounded-b-lg" : "rounded-l-none rounded-r-lg",
                                        )}
                                        onClick={() => openStartDebugModal()}
                                    >
                                        <Bug className="size-4 shrink-0" />
                                        <span className="group-data-[collapsible=icon]:hidden">Debug</span>
                                    </Button>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" align="center">
                                        Debug
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        {visibleSessions.length > 0 ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton onClick={() => projectIdOrUndefined != null && openChatSessionsModal(projectIdOrUndefined)}>
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
                        <SidebarMenuButton asChild isActive={isRuntimeEnvVarsActive} tooltip="Variables">
                            <Link to={runtimeEnvVarsUrl}>
                                <KeyRound />
                                <span>Variables</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isUsageActive} tooltip="Usage">
                            <Link to={usageUrl}>
                                <Gauge />
                                <span>Usage</span>
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
