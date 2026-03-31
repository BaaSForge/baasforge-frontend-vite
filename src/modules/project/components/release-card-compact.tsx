"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTimeMedium } from "@/utils/time";
import { type ReactNode, useState } from "react";
import type { ProjectRuntimeResponse, ReleaseResponse } from "../types";
import { ReleaseNotesModal } from "./release-notes-modal";

export interface ReleaseCardCompactProps {
    release: ReleaseResponse;
    className?: string;
    selected?: boolean;
    runtime?: ProjectRuntimeResponse;
    onClick?: () => void;
    /** Dims the card when this production revision is a leaf (not shipped to prod yet). */
    undeployedProductionLeafMuted?: boolean;
    /** Extra controls in the footer row (e.g. deploy); clicks must call stopPropagation if the card is clickable. */
    cardActionEnd?: ReactNode;
}

export function ReleaseCardCompact({
    release,
    runtime,
    className,
    selected,
    onClick,
    undeployedProductionLeafMuted,
    cardActionEnd,
}: ReleaseCardCompactProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const isLive = !!runtime;
    const showNotShippedBadge = !!undeployedProductionLeafMuted && !isLive;

    const badges = (
        <>
            <Badge
                variant="secondary"
                className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[0.625rem]"
                title={`revision ${release.revision} · id ${release.id}`}
            >
                revision {release.revision}
            </Badge>
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
                showNotShippedBadge && "opacity-[0.72]",
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
                            ariaLabel="Show full release notes"
                            onClick={() => setModalOpen(true)}
                            className="rounded-t-xl rounded-b-none"
                        >
                            Read full release notes
                        </ExpandableFullReadTrigger>
                    )}
                >
                    <Markdown components={{ pre: () => null }}>{release.notes}</Markdown>
                </Expandable>
                <ReleaseNotesModal open={modalOpen} onOpenChange={setModalOpen} notes={release.notes ?? ""} badges={badges} />
                <CardAction
                    className={cn(
                        "bg-muted/30 w-full flex flex-wrap items-center justify-start gap-2 border-t p-2",
                        cardActionEnd != null ? "justify-between" : "justify-start",
                        selected && "bg-emerald-200/40 dark:bg-emerald-900/40 border-emerald-500",
                    )}
                >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{badges}</div>
                    {cardActionEnd != null ? <div className="flex shrink-0 items-center gap-2">{cardActionEnd}</div> : null}
                </CardAction>
            </Card>
            {selected && (
                <span
                    className="absolute top-1.5 right-1.5 rounded-full bg-emerald-500 text-xs text-white px-2 py-0.5 font-semibold pointer-events-none select-none shadow"
                    aria-hidden="true"
                >
                    Selected
                </span>
            )}
        </div>
    );
}
