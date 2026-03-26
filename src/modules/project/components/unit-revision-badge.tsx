"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "../types";
import { isUnitRevisionStale } from "../unit-revision-stale";

export function UnitRevisionBadge({ unit, className }: { unit: ProjectUnitResponse; className?: string }) {
    const stale = isUnitRevisionStale(unit);
    const latest = unit.latest_revision;
    const title =
        stale && latest != null
            ? `revision ${unit.revision} — newer revision ${latest} is available`
            : `revision ${unit.revision}`;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "text-[0.625rem]",
                stale
                    ? "border-muted-foreground/35 border-dashed bg-muted/80 text-muted-foreground"
                    : "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400",
                className,
            )}
            title={title}
        >
            revision {unit.revision}
            {stale && latest != null ? <> / {latest}</> : null}
        </Badge>
    );
}
