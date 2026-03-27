"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Loader2Icon, Sparkles, Trash2 } from "lucide-react";
import type { ProjectUnitResponse } from "../types";
import { isUnitRevisionStale } from "../unit-revision-stale";
import { useChatSessionUnitLatestRevision } from "../use-chat-session-unit-latest-revision";

export type UnitRevisionBadgeProps = {
    unit: ProjectUnitResponse;
    /**
     * Omit on unit cards. When provided (including `null`), the badge keeps the same look as the base
     * mode; only the tooltip and revision line reflect before → after for this chat.
     */
    beforeUnit?: ProjectUnitResponse | null;
    /** When both are set, stale/latest display prefers `chatSessionUnitLatestRevisionsByUnitId` for this session. */
    projectId?: string;
    chatSessionId?: string;
    className?: string;
    refreshPending?: boolean;
};

function diffRevisionLabel(beforeUnit: ProjectUnitResponse | null, after: ProjectUnitResponse) {
    if (after.is_deleted && beforeUnit == null) {
        return (
            <>
                revision {after.revision} (New) → Deleted
            </>
        );
    }
    if (after.is_deleted && beforeUnit != null) {
        return (
            <>
                revision {beforeUnit.revision} → Deleted
            </>
        );
    }
    if (beforeUnit == null) {
        return (
            <>
                revision {after.revision} (New)
            </>
        );
    }
    return (
        <>
            revision {beforeUnit.revision} → {after.revision}
        </>
    );
}

export function UnitRevisionBadge({
    unit,
    beforeUnit,
    projectId,
    chatSessionId,
    className,
    refreshPending,
}: UnitRevisionBadgeProps) {
    const latestFromCache = useChatSessionUnitLatestRevision(projectId, chatSessionId, unit.id);
    const isDiff = beforeUnit !== undefined;

    const stale = !isDiff && isUnitRevisionStale(unit, latestFromCache);
    const latest = latestFromCache ?? unit.latest_revision;
    const isDeleted = unit.is_deleted === true;
    /** Aligns diff “new” with dashed first-revision styling; base mode uses live revision + stale. */
    const isFirstRevisionOnly = isDiff
        ? beforeUnit == null && !isDeleted
        : unit.revision === 1 && !stale;
    /** Deleted unit still on latest revision — solid destructive fill; outdated deleted — destructive outline only. */
    const deletedFullDestructiveBg = isDeleted && !stale;

    let tooltipContent: string;
    if (isDiff) {
        if (isDeleted && beforeUnit == null) {
            tooltipContent = "Just created, then deleted";
        } else if (isDeleted && beforeUnit != null) {
            tooltipContent = `Revision ${beforeUnit.revision} → deleted`;
        } else if (isFirstRevisionOnly) {
            tooltipContent = "Just created";
        } else if (beforeUnit != null) {
            tooltipContent = `Revision ${beforeUnit.revision} → ${unit.revision} (vs before this chat)`;
        } else {
            tooltipContent = "Just created";
        }
    } else {
        const baseTooltip = refreshPending
            ? "Refreshing…"
            : stale && latest != null
              ? `Outdated (${unit.revision} / ${latest})`
              : isFirstRevisionOnly
                ? "Just created"
                : "Latest";
        tooltipContent = isDeleted ? `${baseTooltip} (deleted)` : baseTooltip;
    }

    const badge = (
        <Badge
            variant={deletedFullDestructiveBg ? "destructive" : isDeleted && stale ? "outline" : "secondary"}
            aria-busy={refreshPending || undefined}
            className={cn(
                "text-[0.625rem]",
                isDeleted &&
                    stale &&
                    "border-destructive/55 bg-transparent text-destructive shadow-none hover:bg-destructive/10 dark:bg-transparent dark:hover:bg-destructive/15 [&>svg]:text-destructive",
                !isDeleted &&
                    (stale
                        ? "border-muted-foreground/35 border-dashed bg-muted/80 text-muted-foreground"
                        : isFirstRevisionOnly
                          ? "border border-dashed border-blue-500/45 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/12 dark:text-blue-300"
                          : "border border-solid border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400"),
                className,
            )}
        >
            {refreshPending ? (
                <Loader2Icon
                    className={cn(
                        "size-2.5 shrink-0 animate-spin",
                        deletedFullDestructiveBg ? "text-white" : isDeleted && stale ? "text-destructive" : "text-blue-600 dark:text-blue-400",
                    )}
                    aria-hidden
                />
            ) : stale ? (
                <AlertTriangle className="size-2.5 shrink-0" aria-hidden />
            ) : isDeleted ? (
                <Trash2 className="size-2.5 shrink-0" aria-hidden />
            ) : isFirstRevisionOnly ? (
                <Sparkles className="size-2.5 shrink-0" aria-hidden />
            ) : (
                <CheckCircle2 className="size-2.5 shrink-0" aria-hidden />
            )}
            {isDiff ? (
                <span className="whitespace-nowrap">{diffRevisionLabel(beforeUnit!, unit)}</span>
            ) : (
                <>
                    revision {unit.revision}
                    {stale && latest != null ? <> / {latest}</> : null}
                </>
            )}
        </Badge>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
    );
}
