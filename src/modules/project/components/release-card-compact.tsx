"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Markdown } from "@/components/markdown";
import { SelectionCornerPill } from "@/components/selection-corner-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTimeMedium } from "@/utils/time";
import { type ReactNode, type SyntheticEvent, useState } from "react";
import { EMPTY_RELEASE_NOTE_DISPLAY, type ProjectRuntimeResponse, type ReleaseResponse } from "../types";
import { ReleaseNotesModal } from "./release-notes-modal";
import { ReleaseRevisionBadge } from "./release-revision-badge";

function stopNestedControlFromSelectingCard(e: SyntheticEvent) {
    e.stopPropagation();
}

export interface ReleaseCardCompactProps {
    release: ReleaseResponse;
    className?: string;
    selected?: boolean;
    runtime?: ProjectRuntimeResponse;
    onClick?: () => void;
    /** Dims the card when this production revision is a leaf (not shipped to prod yet). */
    undeployedProductionLeafMuted?: boolean;
    /** Off the live → ancestor production line; dimmed to distinguish branch revisions. */
    offProductionLine?: boolean;
    /** Extra controls in the footer row (e.g. deploy); clicks must call stopPropagation if the card is clickable. */
    cardActionEnd?: ReactNode;
    /**
     * Optional trailing control(s) in the footer's bottom row, right side (e.g. overflow menu).
     * Triggers should call `stopPropagation` so a clickable card does not also fire.
     */
    cardOverflowMenu?: ReactNode;
}

export function ReleaseCardCompact({
    release,
    runtime,
    className,
    selected,
    onClick,
    undeployedProductionLeafMuted,
    offProductionLine,
    cardActionEnd,
    cardOverflowMenu,
}: ReleaseCardCompactProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const isLive = !!runtime;
    const showNotShippedBadge = !!undeployedProductionLeafMuted && !isLive;

    const dimClass =
        selected ? undefined : offProductionLine ? "opacity-50 text-muted-foreground" : showNotShippedBadge ? "opacity-[0.72]" : undefined;

    const badges = (
        <>
            <ReleaseRevisionBadge revision={release.revision} releaseId={release.id} />
            {release.is_stage && (
                <Badge variant="outline" className="text-[0.625rem]">
                    Stage
                </Badge>
            )}
            {showNotShippedBadge && (
                <Badge variant="outline" className="text-[0.625rem] text-muted-foreground border-dashed">
                    Not shipped
                </Badge>
            )}
            {isLive && <LiveBadge isOn onLabel="Live" />}
            <Badge variant="outline" className="text-[0.625rem]">
                {formatDateTimeMedium(release.created_at)}
            </Badge>
        </>
    );

    return (
        <div
            className={cn(
                "relative inline-block w-full min-w-0",
                dimClass,
                selected && "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 opacity-100",
                className,
            )}
            aria-selected={selected}
            onClick={onClick}
        >
            <Card
                className={cn(
                    "p-0 z-10 rounded-xl border shadow-none overflow-hidden gap-0 transition-shadow transition-colors",
                    selected && "border-emerald-500 shadow-lg",
                    showNotShippedBadge && !selected && "border-muted-foreground/25",
                )}
            >
                <Expandable
                    className="group/expandable-read relative overflow-hidden rounded-t-xl rounded-b-none p-2 text-xs"
                    maxLines={4}
                    bottomEdgeFade
                    bottomEdgeFadeFromClassName="from-card"
                    trigger={() => (
                        <ExpandableFullReadTrigger
                            variant="corner-icon"
                            ariaLabel="Show full release notes"
                            onClick={() => setModalOpen(true)}
                        />
                    )}
                >
                    <Markdown components={{ pre: () => null }}>
                        {release.brief_note?.trim() || EMPTY_RELEASE_NOTE_DISPLAY}
                    </Markdown>
                </Expandable>
                <ReleaseNotesModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    notes={release.notes?.trim() || EMPTY_RELEASE_NOTE_DISPLAY}
                    badges={badges}
                />
                <CardAction
                    className={cn(
                        "bg-muted/30 w-full flex flex-wrap items-center justify-start gap-2 border-t p-2",
                        cardActionEnd != null || cardOverflowMenu != null ? "justify-between" : "justify-start",
                        selected && "bg-emerald-200/40 dark:bg-emerald-900/40 border-emerald-500",
                    )}
                >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{badges}</div>
                    {cardActionEnd != null || cardOverflowMenu != null ? (
                        <div className="ml-auto flex shrink-0 items-center justify-end gap-1 self-end">
                            {cardActionEnd != null ? <div className="flex items-center gap-2">{cardActionEnd}</div> : null}
                            {cardOverflowMenu != null ? (
                                <div className="flex items-center" onClick={stopNestedControlFromSelectingCard}>
                                    {cardOverflowMenu}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </CardAction>
            </Card>
            {selected ? <SelectionCornerPill>Selected</SelectionCornerPill> : null}
        </div>
    );
}
