"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { isUnitRevisionStale } from "@/modules/project/unit-revision-stale";
import { useChatSessionUnitLatestRevision } from "@/modules/project/use-chat-session-unit-latest-revision";
import { AlertTriangle } from "lucide-react";

export type ChatSessionDiffNewerRevisionChipProps = {
    unit: ProjectUnitResponse;
    projectId?: string;
    chatSessionId?: string;
    className?: string;
};

/**
 * Diff modal only: warns when the displayed unit revision is behind the latest known for this session.
 */
export function ChatSessionDiffNewerRevisionChip({
    unit,
    projectId,
    chatSessionId,
    className,
}: ChatSessionDiffNewerRevisionChipProps) {
    const latestFromCache = useChatSessionUnitLatestRevision(projectId, chatSessionId, unit.id);
    const latest = latestFromCache ?? unit.latest_revision;
    const stale = isUnitRevisionStale(unit, latestFromCache);

    if (!stale || latest == null) return null;

    return (
        <Badge
            variant="outline"
            role="status"
            className={cn(
                "inline-flex shrink-0 items-center gap-0.5 border-amber-500/45 bg-amber-500/10 text-[0.625rem] font-medium text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/12 dark:text-amber-100",
                className,
            )}
        >
            <AlertTriangle className="size-2.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <span className="whitespace-nowrap">Newer revision {latest} exists</span>
        </Badge>
    );
}
