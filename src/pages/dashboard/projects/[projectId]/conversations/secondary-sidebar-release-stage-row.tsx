"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CompactReleaseBadge } from "@/modules/project";
import { FlaskConical } from "lucide-react";
import { stageReleaseRowView } from "./components/message/release-controller-row-view-models";
import type { ReleaseControllerActions } from "./components/message/use-release-controller-actions";

export function SecondarySidebarReleaseStageRow({
    actions,
    projectId,
}: {
    actions: ReleaseControllerActions;
    projectId: string;
}) {
    const { stageRelease, setStageReleaseModalOpen, handleStageRedeploy } = actions;
    const view = stageReleaseRowView(actions, projectId);

    if (view.kind === "none") return null;

    if (view.kind === "live-badge" && stageRelease != null) {
        return (
            <div className="w-full min-w-0">
                <CompactReleaseBadge
                    release={stageRelease}
                    projectId={projectId}
                    className="h-8 w-full max-w-none justify-center gap-1.5 rounded-md px-2 py-0 text-[0.625rem] font-semibold"
                />
            </div>
        );
    }

    if (view.kind === "no-runtimes") {
        return (
            <div className="w-full min-w-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex w-full">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full justify-center gap-2 text-xs"
                                disabled
                            >
                                <FlaskConical className="size-3 shrink-0" aria-hidden />
                                <span className="min-w-0 text-left">Deploy revision {view.revision} to stage</span>
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
            <div className="w-full min-w-0">
                <span className="flex w-full">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 text-xs"
                        disabled={view.disabled}
                        aria-busy={view.pending}
                        onClick={() => void handleStageRedeploy()}
                    >
                        {view.pending ? (
                            <>
                                <Spinner className="size-3 shrink-0" />
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
            <div className="w-full min-w-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex w-full">
                            <Button type="button" variant="outline" size="sm" className="w-full justify-center text-xs" disabled>
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
        <div className="w-full min-w-0">
            <span className="flex w-full">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 text-xs"
                    onClick={() => setStageReleaseModalOpen(true)}
                >
                    <FlaskConical className="size-3 shrink-0" aria-hidden />
                    <span className="min-w-0 text-left">Release Stage</span>
                </Button>
            </span>
        </div>
    );
}
