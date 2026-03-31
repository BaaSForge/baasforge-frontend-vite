"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectRuntimeResponse, ReleaseResponse } from "../types";
import { MessageSquare, MoreVertical, Rocket } from "lucide-react";
import { Link } from "react-router";

/** Whether the release card ⋮ menu would render for this release. */
export function releaseCardHasToolsActions(release: ReleaseResponse, liveProductionReleaseId: string | null): boolean {
    const chatSessionId = release.chat_session_id?.trim() ?? "";
    const hasChatLink = chatSessionId !== "";
    const isLiveOnProduction = liveProductionReleaseId != null && release.id === liveProductionReleaseId;
    const showDeployInMenu = !release.is_stage && !isLiveOnProduction;
    return hasChatLink || showDeployInMenu;
}

export type ReleaseCardToolsDropdownProps = {
    release: ReleaseResponse;
    projectId: string;
    /** `location.search` — preserved when navigating to chat. */
    search: string;
    productionRuntime: ProjectRuntimeResponse | null;
    liveProductionReleaseId: string | null;
    onRequestDeploy: (release: ReleaseResponse) => void;
};

/** ⋮ menu for release cards (open chat + deploy). Renders nothing when there are no actions. */
export function ReleaseCardToolsDropdown({
    release,
    projectId,
    search,
    productionRuntime,
    liveProductionReleaseId,
    onRequestDeploy,
}: ReleaseCardToolsDropdownProps) {
    if (!releaseCardHasToolsActions(release, liveProductionReleaseId)) {
        return null;
    }

    const chatSessionId = release.chat_session_id?.trim() ?? "";
    const hasChatLink = chatSessionId !== "";
    const isLiveOnProduction = liveProductionReleaseId != null && release.id === liveProductionReleaseId;
    const showDeployInMenu = !release.is_stage && !isLiveOnProduction;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground shrink-0"
                    aria-label="Release actions"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="size-3" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="min-w-[11rem]" onClick={(e) => e.stopPropagation()}>
                {hasChatLink ? (
                    <DropdownMenuItem asChild className="py-1.5 text-xs">
                        <Link
                            to={`/dashboard/projects/${projectId}/conversations/${chatSessionId}${search}`}
                            className="cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MessageSquare className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                            Open chat session
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                {showDeployInMenu
                    ? productionRuntime == null
                        ? (
                              <DropdownMenuItem disabled className="py-1.5 text-xs" title="No production runtime configured.">
                                  <Rocket className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                                  Deploy to production
                              </DropdownMenuItem>
                          )
                        : (
                              <DropdownMenuItem
                                  className="py-1.5 text-xs"
                                  title="Deploy this revision to production"
                                  onSelect={() => onRequestDeploy(release)}
                              >
                                  <Rocket className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                                  Deploy to production
                              </DropdownMenuItem>
                          )
                    : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
