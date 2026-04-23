"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, MoreVertical } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

export type UnitCardToolsDropdownProps = {
    projectId: string;
    /** Trimmed `ProjectUnitResponse.chat_session_id`. */
    sourceChatSessionId: string;
    /** When false, renders nothing (e.g. off the units & releases page). */
    enabled?: boolean;
    /** Shown after the chat link when present; can be the only items when `sourceChatSessionId` is empty. */
    extraMenuItems?: ReactNode;
};

/** ⋮ menu for unit cards with a link to the chat session that created the unit. */
export function UnitCardToolsDropdown({
    projectId,
    sourceChatSessionId,
    enabled = true,
    extraMenuItems,
}: UnitCardToolsDropdownProps) {
    const location = useLocation();
    const hasChatLink = sourceChatSessionId !== "";

    if (!enabled || projectId === "") {
        return null;
    }
    if (!hasChatLink && extraMenuItems == null) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground shrink-0"
                    aria-label="Unit actions"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="size-3" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="min-w-[11rem]" onClick={(e) => e.stopPropagation()}>
                {hasChatLink ? (
                    <DropdownMenuItem asChild className="py-1.5 text-xs">
                        <Link
                            to={`/dashboard/projects/${projectId}/conversations/${sourceChatSessionId}${location.search}`}
                            className="cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MessageSquare className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                            Open chat session
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                {extraMenuItems}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
