"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlaskConical, Rocket } from "lucide-react";
import { useProjectRuntimesQuery } from "../queries";
import { PlatformEnvironmentType, type ReleaseResponse } from "../types";

export interface CompactReleaseBadgeProps {
    release: ReleaseResponse;
    /** When set, runtimes are loaded: stage releases turn amber when live; production releases turn green when live. */
    projectId?: string;
    className?: string;
}

export function CompactReleaseBadge({ release, projectId, className }: CompactReleaseBadgeProps) {
    const { data: runtimes } = useProjectRuntimesQuery(projectId);
    const isLiveOnRuntime =
        runtimes?.some((r) => {
            const envMatches = release.is_stage
                ? r.environment === PlatformEnvironmentType.stage
                : r.environment === PlatformEnvironmentType.prod;
            return envMatches && r.liveRelease != null && r.liveRelease.id === release.id;
        }) ?? false;

    const kind = release.is_stage ? "Stage" : "Production";
    const mainLabel = `${kind} release ${release.revision}`;
    const title = `${mainLabel}${isLiveOnRuntime ? " — live on a runtime" : ""}`;
    const Icon = release.is_stage ? FlaskConical : Rocket;
    const isStage = release.is_stage;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "inline-flex max-w-full shrink-0 items-center gap-1 rounded-md font-medium text-[0.625rem]",
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
            title={title}
        >
            <Icon className="shrink-0 opacity-90" aria-hidden />
            <span className="min-w-0 truncate">{mainLabel}</span>
            {isLiveOnRuntime && (
                <span
                    className={cn(
                        "shrink-0 rounded border px-1 py-px text-[0.5rem] font-semibold uppercase leading-none tracking-wide",
                        isStage
                            ? "border-amber-400/60 bg-amber-200/90 text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/25 dark:text-amber-50"
                            : "border-emerald-400/60 bg-emerald-200/90 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-400/25 dark:text-emerald-50",
                    )}
                >
                    Live
                </span>
            )}
        </Badge>
    );
}
