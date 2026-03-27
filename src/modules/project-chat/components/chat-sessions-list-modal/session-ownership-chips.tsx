"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { cn } from "@/lib/utils";
import { CompactReleaseBadge } from "@/modules/project";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";
import { isUnitRevisionStale } from "@/modules/project/unit-revision-stale";
import { useChatSessionUnitLatestRevision } from "@/modules/project/use-chat-session-unit-latest-revision";

export function CompactSessionUnitChip({
    unit,
    projectId,
    chatSessionId,
    className,
}: {
    unit: ProjectUnitResponse;
    projectId?: string;
    /** Revisions in this map are scoped to this chat session. */
    chatSessionId?: string;
    className?: string;
}) {
    const latestFromCache = useChatSessionUnitLatestRevision(projectId, chatSessionId, unit.id);
    const stale = isUnitRevisionStale(unit, latestFromCache);
    const latest = latestFromCache ?? unit.latest_revision;
    const revisionText =
        stale && latest != null ? `revision ${unit.revision} / ${latest}` : `revision ${unit.revision}`;

    return (
        <span
            className={cn(
                "inline-flex max-w-[calc(100%-1rem)] min-h-[1.375rem] min-w-0 shrink-0 items-center gap-2 rounded-[4px] border border-border/45 bg-muted px-2 py-0.5 font-mono text-[0.625rem] leading-tight text-muted-foreground dark:border-border/50 z-[3]",
                stale && "opacity-90",
                className,
            )}
            title={`${unit.id} · ${revisionText}`}
        >
            <span className="min-w-0 truncate">{unit.id}</span>
            <span className="shrink-0 text-muted-foreground/80">·</span>
            <span className="shrink-0 tabular-nums">{revisionText}</span>
        </span>
    );
}

export function SessionOwnershipChipsRow({
    projectId,
    chatSessionId,
    ownedReleases = [],
    ownedUnits = [],
    className,
}: {
    projectId?: string;
    /** Session that `ownedUnits` belong to (required for revision cache alignment). */
    chatSessionId?: string;
    ownedReleases?: ReleaseResponse[];
    ownedUnits?: ProjectUnitResponse[];
    className?: string;
}) {
    if (ownedReleases.length === 0 && ownedUnits.length === 0) return null;

    const scrollRowClass = "min-h-0 min-w-0 w-full max-w-full";
    const chipRowClass = "flex w-max flex-nowrap items-center gap-1.5 py-0.5 pr-1";

    return (
        <div className={cn("flex w-full min-w-0 flex-col gap-1", className)}>
            {ownedUnits.length > 0 ? (
                <FadedScrollArea
                    orientation="horizontal"
                    horizontalIntrinsicHeight
                    hideScrollbar
                    className={cn(scrollRowClass, "mt-1.5")}
                >
                    <div className={chipRowClass}>
                        {ownedUnits.map((unit) => (
                            <CompactSessionUnitChip
                                key={`${unit.id}-${unit.revision}`}
                                projectId={projectId}
                                chatSessionId={chatSessionId}
                                unit={unit}
                            />
                        ))}
                    </div>
                </FadedScrollArea>
            ) : null}
            {ownedReleases.length > 0 ? (
                <FadedScrollArea
                    orientation="horizontal"
                    horizontalIntrinsicHeight
                    hideScrollbar
                    className={scrollRowClass}
                >
                    <div className={chipRowClass}>
                        {ownedReleases.map((release) => (
                            <CompactReleaseBadge key={release.id} release={release} projectId={projectId} />
                        ))}
                    </div>
                </FadedScrollArea>
            ) : null}
        </div>
    );
}
