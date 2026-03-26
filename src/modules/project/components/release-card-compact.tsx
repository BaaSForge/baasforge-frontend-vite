"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction } from "@/components/ui/card";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { cn } from "@/lib/utils";
import { formatDateTimeMedium } from "@/utils/time";
import { useState } from "react";
import type { ProjectRuntimeResponse, ReleaseResponse } from "../types";

export interface ReleaseCardCompactProps {
    release: ReleaseResponse;
    className?: string;
    selected?: boolean;
    runtime?: ProjectRuntimeResponse;
    onClick?: () => void;
}

export function ReleaseCardCompact({ release, runtime, className, selected, onClick }: ReleaseCardCompactProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const isLive = !!runtime;

    const badges = (
        <>
            <Badge
                variant="secondary"
                className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[0.625rem]"
                title={`Version ${release.version}`}
            >
                {release.version}
            </Badge>
            {isLive && (
                <Badge variant="outline" className="text-[0.625rem]">
                    deployed to {runtime.name}
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
            className={cn("relative inline-block w-full min-w-0", selected && "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40", className)}
            aria-selected={selected}
            onClick={onClick}
        >
            <Card
                className={cn(
                    "p-0 z-10 rounded-xl border shadow-none overflow-hidden gap-0 transition-shadow transition-colors",
                    selected && "border-emerald-500 shadow-lg",
                )}
            >
                <Expandable
                    className="group/expandable-read p-2 text-xs relative"
                    maxLines={4}
                    bottomEdgeFade
                    bottomEdgeFadeFromClassName="from-card"
                    trigger={(_isOpen, _setOpen) => (
                        <ExpandableFullReadTrigger ariaLabel="Show full release notes" onClick={() => setModalOpen(true)}>
                            Read full release notes
                        </ExpandableFullReadTrigger>
                    )}
                >
                    <Markdown components={{ pre: () => null }}>{release.notes}</Markdown>
                </Expandable>
                <CentricModal open={modalOpen} onOpenChange={setModalOpen}>
                    <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                        <CentricModalHeader>
                            <CentricModalTitle>Release notes</CentricModalTitle>
                            <div className="flex flex-wrap items-center gap-1">{badges}</div>
                        </CentricModalHeader>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <Markdown>{release.notes}</Markdown>
                        </div>
                    </CentricModalContent>
                </CentricModal>
                <CardAction
                    className={cn(
                        "bg-muted/30 w-full flex flex-wrap items-center justify-start p-2 gap-2 border-t",
                        selected && "bg-emerald-200/40 dark:bg-emerald-900/40 border-emerald-500",
                    )}
                >
                    {badges}
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
