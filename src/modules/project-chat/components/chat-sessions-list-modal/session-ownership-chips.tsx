"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";

export function CompactSessionReleaseBadge({ release, className }: { release: ReleaseResponse; className?: string }) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                "shrink-0 border-emerald-500/30 bg-emerald-500/15 text-[0.625rem] text-emerald-700 dark:text-emerald-400",
                className,
            )}
            title={release.version}
        >
            revision {release.version}
        </Badge>
    );
}

export function CompactSessionUnitChip({ unit, className }: { unit: ProjectUnitResponse; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[0.625rem] tabular-nums text-muted-foreground",
                className,
            )}
            title={`${unit.id} · revision ${unit.revision}`}
        >
            <span className="min-w-0 truncate font-mono text-foreground">{unit.id}</span>
            <span className="shrink-0 text-muted-foreground">·</span>
            <span className="shrink-0">revision {unit.revision}</span>
        </span>
    );
}

export function SessionOwnershipChipsRow({
    ownedReleases = [],
    ownedUnits = [],
    className,
}: {
    ownedReleases?: ReleaseResponse[];
    ownedUnits?: ProjectUnitResponse[];
    className?: string;
}) {
    if (ownedReleases.length === 0 && ownedUnits.length === 0) return null;

    return (
        <div className={cn("w-full min-w-0", className)}>
            <FadedScrollArea
                orientation="horizontal"
                horizontalIntrinsicHeight
                hideScrollbar
                className="min-h-0 min-w-0 w-full max-w-full"
            >
                <div className="flex w-max flex-nowrap items-center gap-1.5 py-0.5 pr-1">
                    {ownedReleases.map((release) => (
                        <CompactSessionReleaseBadge key={release.id} release={release} />
                    ))}
                    {ownedUnits.map((unit) => (
                        <CompactSessionUnitChip key={`${unit.id}-${unit.revision}`} unit={unit} />
                    ))}
                </div>
            </FadedScrollArea>
        </div>
    );
}
