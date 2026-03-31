import {
    SecondarySidebarContent,
    SecondarySidebarStickyHeader,
} from "@/components/secondary-sidebar/secondary-sidebar-content";
import { SectionTitle } from "@/components/section-title";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QueryKeys } from "@/constants/query-keys";
import { detachRuntimeLiveRelease, postRuntimeDeployProductionRelease } from "@/modules/project/api";
import { ReleaseCardCompact } from "@/modules/project/components/release-card-compact";
import { useProjectReleasesQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import { listProductionReleasesSortedForSidebar } from "@/modules/project/production-release-lineage";
import { getRuntimeLiveReleaseId, pickProductionRuntime } from "@/modules/project/runtime-release";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { isUndeployedProductionLeaf } from "@/modules/project/undeployed-production-release";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export function SecondarySideBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId, releaseID } = useParams<{
        projectId: string;
        releaseID: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;

    const { data: releases, isLoading, error } = useProjectReleasesQuery(projectIdOrUndefined, PlatformEnvironmentType.prod);
    const { data: runtimes, isLoading: isRuntimesLoading, error: isRuntimesError } = useProjectRuntimesQuery(projectIdOrUndefined);

    const productionRuntime = useMemo(() => pickProductionRuntime(runtimes), [runtimes]);
    const liveProductionReleaseId = useMemo(() => getRuntimeLiveReleaseId(productionRuntime), [productionRuntime]);

    const { orderedReleases, productionLineageIds } = useMemo(() => {
        if (releases == null) return { orderedReleases: [] as ReleaseResponse[], productionLineageIds: new Set<string>() };
        const { ordered, lineageIds } = listProductionReleasesSortedForSidebar(releases, liveProductionReleaseId);
        return { orderedReleases: ordered, productionLineageIds: lineageIds };
    }, [releases, liveProductionReleaseId]);

    const [deployTarget, setDeployTarget] = useState<ReleaseResponse | null>(null);
    const queryClient = useQueryClient();

    const deployProductionMutation = useMutation({
        mutationFn: async (release: ReleaseResponse) => {
            if (projectIdOrUndefined == null) throw new Error("Missing project");
            if (productionRuntime == null) throw new Error("Missing production runtime");
            if (release.chat_session_id == null || release.chat_session_id === "") {
                throw new Error("Release is missing chat_session_id; cannot deploy by revision.");
            }
            const body = { revision: release.revision, chat_session_id: release.chat_session_id };
            const liveId = productionRuntime.live_release?.id ?? null;
            const swapOtherLive = liveId != null && liveId !== release.id;
            if (swapOtherLive) {
                await detachRuntimeLiveRelease(projectIdOrUndefined, productionRuntime.id, body);
            } else {
                await postRuntimeDeployProductionRelease(projectIdOrUndefined, productionRuntime.id, body);
            }
        },
        onSuccess: async (_data, deployedRelease) => {
            if (projectIdOrUndefined == null) return;
            setDeployTarget(null);
            navigate(`/dashboard/projects/${projectIdOrUndefined}/units-releases/${deployedRelease.id}${location.search}`);
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectIdOrUndefined) });
            await queryClient.invalidateQueries({
                queryKey: QueryKeys.projectReleases(projectIdOrUndefined, PlatformEnvironmentType.prod),
            });
            toast.success("Production deploy has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start production deploy.", { position: "top-center" });
        },
    });

    if (projectIdOrUndefined == null) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">No project selected.</div>
            </SecondarySidebarContent>
        );
    }

    if (isLoading || isRuntimesLoading) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">Loading releases or runtimes…</div>
            </SecondarySidebarContent>
        );
    }

    if (error || isRuntimesError) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-destructive">Failed to load releases or runtimes.</div>
            </SecondarySidebarContent>
        );
    }

    if (releases == null || releases.length === 0 || orderedReleases.length === 0 || runtimes == null || runtimes.length === 0) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">No releases yet.</div>
            </SecondarySidebarContent>
        );
    }

    const hasProductionLine = productionLineageIds.size > 0;

    const replacesOtherRevision =
        deployTarget != null &&
        liveProductionReleaseId != null &&
        deployTarget.id !== liveProductionReleaseId;

    return (
        <>
            <SecondarySidebarContent
                header={
                    <SecondarySidebarStickyHeader className="pt-3 pb-[calc(1rem+1px)]">
                        <SectionTitle className="mb-0">Choose release to view units</SectionTitle>
                    </SecondarySidebarStickyHeader>
                }
            >
                <div className="flex flex-col gap-2">
                    {orderedReleases.map((release, index) => {
                        const undeployedProductionLeafMuted =
                            isUndeployedProductionLeaf(release, orderedReleases) && release.id !== liveProductionReleaseId;

                        const isLiveOnProduction =
                            liveProductionReleaseId != null && release.id === liveProductionReleaseId;

                        const deployButton =
                            release.is_stage || isLiveOnProduction ? null : productionRuntime == null ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
                                            <Button type="button" variant="outline" size="xs" disabled className="shrink-0">
                                                <Rocket className="size-3 shrink-0" aria-hidden />
                                                Prod
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">No production runtime configured.</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            className="shrink-0"
                                            aria-label={`Deploy revision ${release.revision} to production`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeployTarget(release);
                                            }}
                                        >
                                            <Rocket className="size-3 shrink-0" aria-hidden />
                                            Deploy
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Deploy this revision to production</TooltipContent>
                                </Tooltip>
                            );

                        return (
                            <React.Fragment key={release.id}>
                                {index > 0 && (
                                    <div className="flex h-4 shrink-0 justify-center">
                                        <Separator orientation="vertical" />
                                    </div>
                                )}
                                <ReleaseCardCompact
                                    release={release}
                                    selected={releaseID != null && release.id === releaseID}
                                    runtime={runtimes.find((rt) => rt.live_release?.id === release.id)}
                                    undeployedProductionLeafMuted={undeployedProductionLeafMuted}
                                    offProductionLine={hasProductionLine && !productionLineageIds.has(release.id)}
                                    cardActionEnd={deployButton}
                                    onClick={() => {
                                        navigate(`/dashboard/projects/${projectId}/units-releases/${release.id}${location.search}`);
                                    }}
                                    className="cursor-pointer"
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
            </SecondarySidebarContent>

            <AlertDialog
                open={deployTarget != null}
                onOpenChange={(open) => {
                    if (!open) setDeployTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Deploy revision {deployTarget?.revision ?? ""} to production?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    This points the production runtime at release revision {deployTarget?.revision ?? ""}. Anyone using
                                    production will run that revision after deploy finishes.
                                </p>
                                {replacesOtherRevision ? (
                                    <p className="text-amber-900 dark:text-amber-100/95">
                                        This replaces the release currently live in production. Older production revisions stay in the
                                        list but will no longer be what production runs.
                                    </p>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deployProductionMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                if (deployTarget == null) return;
                                deployProductionMutation.mutate(deployTarget);
                            }}
                            disabled={deployProductionMutation.isPending || deployTarget == null}
                        >
                            {deployProductionMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Deploying…
                                </>
                            ) : (
                                <>Deploy revision {deployTarget?.revision ?? ""}</>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
