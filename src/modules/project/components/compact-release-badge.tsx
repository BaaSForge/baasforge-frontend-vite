"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlaskConical, Rocket } from "lucide-react";
import { useProjectRuntimesQuery } from "../queries";
import type { ReleaseResponse } from "../types";

export interface CompactReleaseBadgeProps {
    release: ReleaseResponse;
    /** When set, runtimes are loaded: stage releases turn amber when live; production releases turn green when live. */
    projectId?: string;
    className?: string;
}

export function CompactReleaseBadge({ release, projectId, className }: CompactReleaseBadgeProps) {
    const { data: runtimes } = useProjectRuntimesQuery(projectId);
    const isLiveOnRuntime =
        runtimes?.some((r) => r.live_release_revision != null && r.live_release_revision === release.revision) ??
        false;

    const kind = release.is_stage ? "Stage" : "Production";
    const label = `${kind} release ${release.revision}${isLiveOnRuntime ? " (live)" : ""}`;
    const Icon = release.is_stage ? FlaskConical : Rocket;
    const isStage = release.is_stage;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "shrink-0 rounded-md font-medium text-[0.625rem]",
                // Stage: muted, blends with chat copy
                isStage &&
                    "border border-stone-200/80 bg-stone-50 text-stone-600 dark:border-stone-600/25 dark:bg-stone-500/8 dark:text-stone-300",
                isStage &&
                    isLiveOnRuntime &&
                    "border-amber-300/90 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100",
                // Production: same type weight/size as stage; reads louder via emerald fill + border (not heavy effects)
                !isStage &&
                    "border border-emerald-300/70 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-100/95",
                !isStage &&
                    isLiveOnRuntime &&
                    "border-emerald-400/85 bg-emerald-100/90 text-emerald-950 dark:border-emerald-400/55 dark:bg-emerald-500/22 dark:text-emerald-50",
                className,
            )}
            title={label}
        >
            <Icon className="shrink-0 opacity-90" aria-hidden />
            {label}
        </Badge>
    );
}
