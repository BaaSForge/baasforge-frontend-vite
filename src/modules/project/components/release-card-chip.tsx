"use client";

import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTimeMedium } from "@/utils/time";
import { useState } from "react";
import { EMPTY_RELEASE_NOTE_DISPLAY, type ReleaseResponse } from "../types";
import { ReleaseNotesModal } from "./release-notes-modal";

export interface ReleaseCardChipProps {
    release: ReleaseResponse;
    className?: string;
}

export function ReleaseCardChip({ release, className }: ReleaseCardChipProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const brief = release.brief_note?.trim() ?? "";
    const notesPreview = brief
        ? brief.length > 60
            ? brief.slice(0, 60) + "…"
            : brief
        : EMPTY_RELEASE_NOTE_DISPLAY;
    const fullNotes = release.notes?.trim() || EMPTY_RELEASE_NOTE_DISPLAY;

    const badges = (
        <>
            <Badge
                variant="secondary"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[0.625rem]"
                title={`revision ${release.revision}`}
            >
                revision {release.revision}
            </Badge>
            {release.is_stage && (
                <Badge variant="outline" className="text-[0.625rem] text-muted-foreground font-normal">
                    Stage
                </Badge>
            )}
            <Badge variant="outline" className="text-[0.625rem] text-muted-foreground font-normal">
                {formatDateTimeMedium(release.created_at)}
            </Badge>
        </>
    );

    return (
        <div
            className={cn(
                "group/expandable-read relative flex shrink-0 flex-col gap-1 overflow-hidden rounded-md border bg-muted/30 px-2.5 py-1.5 min-w-0 max-w-[200px]",
                className,
            )}
            title={brief || EMPTY_RELEASE_NOTE_DISPLAY}
        >
            <div className="flex flex-wrap items-center gap-1">{badges}</div>
            <p className="truncate text-[0.6875rem] text-muted-foreground">{notesPreview}</p>
            <ExpandableFullReadTrigger ariaLabel="Show full release notes" onClick={() => setModalOpen(true)}>
                Read full release notes
            </ExpandableFullReadTrigger>
            <ReleaseNotesModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                notes={fullNotes}
                badges={badges}
            />
        </div>
    );
}
