"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CompactReleaseBadge } from "@/modules/project";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";
import { prodReleaseDisabledTooltip, prodReleaseRowView } from "./release-controller-row-view-models";
import { APP_RELEASE_CONTROLLER_PROD_BUTTON_DATA_ATTR, APP_RELEASE_CONTROLLER_PROD_RELEASE_LINK_DATA_ATTR } from "./release-controller-tutorial-targets";
import type { ReleaseControllerActions } from "./use-release-controller-actions";

export function ReleaseControllerThreadProdRow({
    actions,
    projectId,
    className,
}: {
    actions: ReleaseControllerActions;
    projectId: string | undefined;
    className?: string;
}) {
    const { prodRelease, setProductionConfirmOpen, handleProdRedeployClick } = actions;
    const view = prodReleaseRowView(actions, projectId);

    if (view.kind === "none") return null;

    if (view.kind === "live-badge" && prodRelease != null) {
        return (
            <div
                className={cn("inline-flex min-w-0", className)}
                {...{ [APP_RELEASE_CONTROLLER_PROD_RELEASE_LINK_DATA_ATTR]: "" }}
            >
                <CompactReleaseBadge release={prodRelease} projectId={projectId} />
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
                                <Rocket className="size-3 shrink-0" aria-hidden />
                                Deploy revision {view.revision} to production
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
            <div className={cn("inline-flex min-w-0", className)}>
                <span className="inline-flex" {...{ [APP_RELEASE_CONTROLLER_PROD_BUTTON_DATA_ATTR]: "" }}>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={view.disabled}
                        aria-busy={view.pending}
                        onClick={() => void handleProdRedeployClick()}
                    >
                        {view.pending ? (
                            <>
                                <Spinner className="size-3" />
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
        return (
            <div className={cn("inline-flex min-w-0", className)}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex">
                            <Button type="button" variant="outline" size="xs" disabled>
                                Release production
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
            <div className={cn("inline-flex min-w-0", className)}>
                <span className="inline-flex" {...{ [APP_RELEASE_CONTROLLER_PROD_BUTTON_DATA_ATTR]: "" }}>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={view.pending}
                        aria-busy={view.pending}
                        onClick={() => setProductionConfirmOpen(true)}
                    >
                        Release production
                    </Button>
                </span>
            </div>
        );
    }

    return null;
}
