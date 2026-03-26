"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTimeMedium } from "@/utils/time";
import type { ReleaseResponse } from "../types";

export interface ReleaseCardChipProps {
    release: ReleaseResponse;
    className?: string;
}

export function ReleaseCardChip({ release, className }: ReleaseCardChipProps) {
    const notesPreview = release.notes?.trim()
        ? release.notes.length > 60
            ? release.notes.slice(0, 60) + "…"
            : release.notes
        : "No release notes";

    return (
        <div
            className={cn(
                "flex shrink-0 flex-col gap-1 rounded-md border bg-muted/30 px-2.5 py-1.5 min-w-0 max-w-[200px]",
                className,
            )}
            title={release.notes ?? undefined}
        >
            <div className="flex flex-wrap items-center gap-1">
                <Badge
                    variant="secondary"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[0.625rem]"
                    title={`revision ${release.version}`}
                >
                    revision {release.version}
                </Badge>
                <span className="text-[0.625rem] text-muted-foreground">
                    {formatDateTimeMedium(release.created_at)}
                </span>
            </div>
            <p className="truncate text-[0.6875rem] text-muted-foreground">{notesPreview}</p>
        </div>
    );
}
