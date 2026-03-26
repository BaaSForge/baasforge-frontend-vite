"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
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
    const title =
        refreshPending
            ? `Refreshing revision ${unit.revision}`
            : stale && latest != null
              ? undefined
              : `revision ${unit.revision}`;

    const badge = (
        <Badge
            variant="secondary"
            aria-busy={refreshPending || undefined}
            className={cn(
                "text-[0.625rem]",
                stale
                    ? "border-muted-foreground/35 border-dashed bg-muted/80 text-muted-foreground"
                    : "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400",
                className,
            )}
            title={title}
        >
            {refreshPending && (
                <Loader2Icon className="size-2.5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" aria-hidden />
            )}
            revision {unit.revision}
            {stale && latest != null ? <> / {latest}</> : null}
        </Badge>
    );

    if (stale && latest != null) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent side="top">Outdated revision</TooltipContent>
            </Tooltip>
        );
    }

    return badge;
}
