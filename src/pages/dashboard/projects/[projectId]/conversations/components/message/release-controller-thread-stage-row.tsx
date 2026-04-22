"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CompactReleaseBadge } from "@/modules/project";
import { cn } from "@/lib/utils";
import { FlaskConical } from "lucide-react";
import { stageReleaseRowView } from "./release-controller-row-view-models";
import type { ReleaseControllerActions } from "./use-release-controller-actions";

export function ReleaseControllerThreadStageRow({
    actions,
    projectId,
    className,
}: {
    actions: ReleaseControllerActions;
    projectId: string | undefined;
    className?: string;
}) {
    const { stageRelease, setStageReleaseModalOpen, handleStageRedeploy } = actions;
    const view = stageReleaseRowView(actions, projectId);

    if (view.kind === "none") return null;

    if (view.kind === "live-badge" && stageRelease != null) {
        return (
            <div className={cn("inline-flex min-w-0", className)}>
                <CompactReleaseBadge release={stageRelease} projectId={projectId} />
            </div>
        );
    }

    if (view.kind === "no-runtimes") {
        return (
            <div className={cn("inline-flex min-w-0", className)}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex">
                            <Button type="button" variant="outline" size="xs" disabled>
                                <FlaskConical className="size-3 shrink-0" aria-hidden />
                                Deploy revision {view.revision} to stage
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">No stage runtimes available.</TooltipContent>
                </Tooltip>
            </div>
        );
    }

    if (view.kind === "deploy") {
        return (
            <div className={cn("inline-flex min-w-0", className)}>
                <span className="inline-flex">
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={view.disabled}
                        aria-busy={view.pending}
                        onClick={() => void handleStageRedeploy()}
                    >
                        {view.pending ? (
                            <>
                                <Spinner className="size-3" />
                                Deploying…
                            </>
                        ) : (
                            <>
                                <FlaskConical className="size-3 shrink-0" aria-hidden />
                                Deploy revision {view.revision} to stage
                            </>
                        )}
                    </Button>
                </span>
            </div>
        );
    }

    if (view.kind === "disabled-release") {
        const tooltip =
            view.reason === "missing-context"
                ? "Missing project or conversation context."
                : "New releases are disabled for this scope because the step was rejected.";
        return (
            <div className={cn("inline-flex min-w-0", className)}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex">
                            <Button type="button" variant="outline" size="xs" disabled>
                                Release Stage
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{tooltip}</TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className={cn("inline-flex min-w-0", className)}>
            <span className="inline-flex">
                <Button type="button" variant="outline" size="xs" onClick={() => setStageReleaseModalOpen(true)}>
                    Release Stage
                </Button>
            </span>
        </div>
    );
}
