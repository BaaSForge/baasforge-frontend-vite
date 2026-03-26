"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Loader2Icon, Sparkles } from "lucide-react";
import type { ProjectUnitResponse } from "../types";
import { isUnitRevisionStale } from "../unit-revision-stale";

export function UnitRevisionBadge({
    unit,
    className,
    refreshPending,
}: {
    unit: ProjectUnitResponse;
    className?: string;
    refreshPending?: boolean;
}) {
    const stale = isUnitRevisionStale(unit);
    const latest = unit.latest_revision;
    const isFirstRevisionOnly = unit.revision === 1 && !stale;

    const tooltipContent = refreshPending
        ? "Refreshing…"
        : stale && latest != null
          ? `Outdated (${unit.revision} / ${latest})`
          : isFirstRevisionOnly
            ? "Just created"
            : "Latest";

    const badge = (
        <Badge
            variant="secondary"
            aria-busy={refreshPending || undefined}
            className={cn(
                "text-[0.625rem]",
                stale
                    ? "border-muted-foreground/35 border-dashed bg-muted/80 text-muted-foreground"
                    : isFirstRevisionOnly
                      ? "border border-dashed border-blue-500/45 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/12 dark:text-blue-300"
                      : "border border-solid border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400",
                className,
            )}
        >
            {refreshPending ? (
                <Loader2Icon
                    className="size-2.5 shrink-0 animate-spin text-blue-600 dark:text-blue-400"
                    aria-hidden
                />
            ) : stale ? (
                <AlertTriangle className="size-2.5 shrink-0" aria-hidden />
            ) : isFirstRevisionOnly ? (
                <Sparkles className="size-2.5 shrink-0" aria-hidden />
            ) : (
                <CheckCircle2 className="size-2.5 shrink-0" aria-hidden />
            )}
            revision {unit.revision}
            {stale && latest != null ? <> / {latest}</> : null}
        </Badge>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
    );
}
