"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, MoreVertical } from "lucide-react";
import { Link, useLocation } from "react-router";

export type UnitCardToolsDropdownProps = {
    projectId: string;
    /** Trimmed `ProjectUnitResponse.chat_session_id`. */
    sourceChatSessionId: string;
    /** When false, renders nothing (e.g. off the units & releases page). */
    enabled?: boolean;
};

/** ⋮ menu for unit cards with a link to the chat session that created the unit. */
export function UnitCardToolsDropdown({ projectId, sourceChatSessionId, enabled = true }: UnitCardToolsDropdownProps) {
    const location = useLocation();

    if (!enabled || projectId === "" || sourceChatSessionId === "") {
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
