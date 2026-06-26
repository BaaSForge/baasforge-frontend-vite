"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlaskConical, Rocket } from "lucide-react";
import { Link } from "react-router";
import { useProjectRuntimesQuery } from "../queries";
import { releaseIsLiveOnProjectRuntimes } from "../runtime-release";
import { PlatformEnvironmentType, type ReleaseResponse } from "../types";

export interface CompactReleaseBadgeProps {
    release: ReleaseResponse;
    /** When set, runtimes are loaded: stage releases turn amber when live; production releases turn green when live. */
    projectId?: string;
    className?: string;
    suppressLink?: boolean;
    onLinkClick?: () => void;
}

export function CompactReleaseBadge({ release, projectId, className, suppressLink, onLinkClick }: CompactReleaseBadgeProps) {
    const { data: runtimes } = useProjectRuntimesQuery(projectId);
    const isLiveOnRuntime = releaseIsLiveOnProjectRuntimes(release, runtimes);
    const servingRuntime = runtimes?.find((runtime) => runtime.live_release?.id === release.id) ?? null;

    const kind = release.is_stage ? "Stage" : "Production";
    const mainLabel = `${kind} release ${release.revision}`;
    const stageRuntimeName = release.is_stage ? servingRuntime?.name?.trim() ?? "" : "";
    const title = `${mainLabel}${stageRuntimeName.length > 0 ? ` on ${stageRuntimeName}` : ""}${isLiveOnRuntime ? " — live on a runtime" : ""} · id ${release.id}`;
    const Icon = release.is_stage ? FlaskConical : Rocket;
    const isStage = release.is_stage;
    const href =
        projectId == null
            ? null
            : release.is_stage && servingRuntime?.environment === PlatformEnvironmentType.stage
              ? `/dashboard/projects/${projectId}/runtimes/${servingRuntime.id}/units-releases?unitsTab=all`
              : `/dashboard/projects/${projectId}/units-releases/${release.id}?unitsTab=all`;

    const linkedBadgeClassName = cn(
        "inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-md py-0 font-medium leading-none text-[0.625rem]",
        isStage &&
            "border border-stone-200/80 bg-stone-50 text-stone-600 dark:border-stone-600/25 dark:bg-stone-500/8 dark:text-stone-300",
        isStage &&
            isLiveOnRuntime &&
            "border-amber-300/90 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100",
        !isStage &&
            "border border-emerald-300/70 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-100/95",
        !isStage &&
            isLiveOnRuntime &&
            "border-emerald-400/85 bg-emerald-100/90 text-emerald-950 dark:border-emerald-400/55 dark:bg-emerald-500/22 dark:text-emerald-50",
        className,
    );
    const innerClassName = "inline-flex min-w-0 max-w-full items-center gap-1";
    const inner = (
        <>
            <Icon className="shrink-0 opacity-90" aria-hidden />
            <span className="min-w-0 truncate">{mainLabel}</span>
            {isStage && stageRuntimeName.length > 0 ? <span className="min-w-0 truncate">on {stageRuntimeName}</span> : null}
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
        </>
    );

    if (href != null) {
        return (
            <Badge asChild variant="secondary" className={linkedBadgeClassName} title={title}>
                {suppressLink ? (
                    <span className={innerClassName}>{inner}</span>
                ) : (
                    <Link to={href} className={innerClassName} onClick={() => onLinkClick?.()}>
                        {inner}
                    </Link>
                )}
            </Badge>
        );
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                "inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-md py-0 font-medium leading-none text-[0.625rem]",
                isStage &&
                    "border border-stone-200/80 bg-stone-50 text-stone-600 dark:border-stone-600/25 dark:bg-stone-500/8 dark:text-stone-300",
                isStage &&
                    isLiveOnRuntime &&
                    "border-amber-300/90 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100",
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
            {isStage && stageRuntimeName.length > 0 ? <span className="min-w-0 truncate">on {stageRuntimeName}</span> : null}
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
