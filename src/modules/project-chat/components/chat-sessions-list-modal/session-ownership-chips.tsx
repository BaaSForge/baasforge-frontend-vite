"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";
import { isUnitRevisionStale } from "@/modules/project/unit-revision-stale";

export function CompactSessionReleaseBadge({ release, className }: { release: ReleaseResponse; className?: string }) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                "shrink-0 rounded-md border-amber-500/45 bg-amber-500/20 font-medium text-[0.625rem] text-amber-950 dark:border-amber-400/45 dark:bg-amber-400/18 dark:text-amber-100",
                className,
            )}
            title={release.version}
        >
            revision {release.version}
        </Badge>
    );
}

export function CompactSessionUnitChip({ unit, className }: { unit: ProjectUnitResponse; className?: string }) {
    const stale = isUnitRevisionStale(unit);
    const latest = unit.latest_revision;
    const revisionText =
        stale && latest != null ? `revision ${unit.revision} / ${latest}` : `revision ${unit.revision}`;

    return (
        <span
            className={cn(
                "inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[0.625rem] font-medium tabular-nums",
                stale
                    ? "border-muted-foreground/35 bg-muted/75 text-muted-foreground dark:border-muted-foreground/40 dark:bg-muted/55"
                    : "border-sky-500/45 bg-sky-500/20 text-sky-950 dark:border-sky-400/45 dark:bg-sky-400/18 dark:text-sky-100",
                className,
            )}
            title={`${unit.id} · ${revisionText}`}
        >
            <span
                className={cn(
                    "min-w-0 truncate font-mono",
                    stale ? "text-muted-foreground" : "text-sky-900 dark:text-sky-50",
                )}
            >
                {unit.id}
            </span>
            <span
                className={cn(
                    "shrink-0",
                    stale ? "text-muted-foreground/80" : "text-sky-700/80 dark:text-sky-300/90",
                )}
            >
                ·
            </span>
            <span className={cn("shrink-0", stale ? "text-muted-foreground" : "text-sky-900 dark:text-sky-50")}>
                {revisionText}
            </span>
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

    const scrollRowClass = "min-h-0 min-w-0 w-full max-w-full";
    const chipRowClass = "flex w-max flex-nowrap items-center gap-1.5 py-0.5 pr-1";

    return (
        <div className={cn("flex w-full min-w-0 flex-col gap-1", className)}>
            {ownedReleases.length > 0 ? (
                <FadedScrollArea
                    orientation="horizontal"
                    horizontalIntrinsicHeight
                    hideScrollbar
                    className={scrollRowClass}
                >
                    <div className={chipRowClass}>
                        {ownedReleases.map((release) => (
                            <CompactSessionReleaseBadge key={release.id} release={release} />
                        ))}
                    </div>
                </FadedScrollArea>
            ) : null}
            {ownedUnits.length > 0 ? (
                <FadedScrollArea
                    orientation="horizontal"
                    horizontalIntrinsicHeight
                    hideScrollbar
                    className={scrollRowClass}
                >
                    <div className={chipRowClass}>
                        {ownedUnits.map((unit) => (
                            <CompactSessionUnitChip key={`${unit.id}-${unit.revision}`} unit={unit} />
                        ))}
                    </div>
                </FadedScrollArea>
            ) : null}
        </div>
    );
}
