"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CompactReleaseBadge } from "@/modules/project";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";
import { prodReleaseDisabledTooltip, prodReleaseRowView } from "./components/message/release-controller-row-view-models";
import type { ReleaseControllerActions } from "./components/message/use-release-controller-actions";

export function SecondarySidebarReleaseProdRow({
    actions,
    projectId,
}: {
    actions: ReleaseControllerActions;
    projectId: string;
}) {
    const { prodRelease, setProductionConfirmOpen, handleProdRedeployClick } = actions;
    const view = prodReleaseRowView(actions, projectId);

    if (view.kind === "none") return null;

    if (view.kind === "live-badge" && prodRelease != null) {
        return (
            <div className="w-full min-w-0">
                <CompactReleaseBadge
                    release={prodRelease}
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
                                <Rocket className="size-3 shrink-0" aria-hidden />
                                <span className="min-w-0 text-left">Deploy revision {view.revision} to production</span>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">No production runtimes available.</TooltipContent>
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
                        onClick={() => void handleProdRedeployClick()}
                    >
                        {view.pending ? (
                            <>
                                <Spinner className="size-3 shrink-0" />
                                Deploying…
                            </>
                        ) : (
                            <>
                                <Rocket className="size-3 shrink-0" aria-hidden />
                                Deploy revision {view.revision} to production
                            </>
                        )}
                    </Button>
                </span>
            </div>
        );
    }

    if (view.kind === "disabled-release") {
        const showRocket = view.reason === "stage-first";
        return (
            <div className="w-full min-w-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex w-full">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn("w-full justify-center text-xs", showRocket && "gap-2")}
                                disabled
                            >
                                {showRocket ? <Rocket className="size-3 shrink-0" aria-hidden /> : null}
                                {showRocket ? (
                                    <span className="min-w-0 text-left">Release production</span>
                                ) : (
                                    "Release production"
                                )}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{prodReleaseDisabledTooltip(view.reason)}</TooltipContent>
                </Tooltip>
            </div>
        );
    }

    if (view.kind === "open-production-confirm") {
        return (
            <div className="w-full min-w-0">
                <span className="flex w-full">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 text-xs"
                        disabled={view.pending}
                        aria-busy={view.pending}
                        onClick={() => setProductionConfirmOpen(true)}
                    >
                        <Rocket className="size-3 shrink-0" aria-hidden />
                        <span className="min-w-0 text-left">Release production</span>
                    </Button>
                </span>
            </div>
        );
    }

    return null;
}
