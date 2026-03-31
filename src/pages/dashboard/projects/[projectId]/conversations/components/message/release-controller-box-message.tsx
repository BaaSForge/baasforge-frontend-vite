"use client";

import type { ReactNode } from "react";

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
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QueryKeys } from "@/constants/query-keys";
import {
    postReleaseControllerProductionRelease,
    postRuntimeDeployProductionRelease,
    postRuntimeDeployStageRelease,
} from "@/modules/project/api";
import { stableUnitIdForRevisionCache } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { CompactReleaseBadge, useProjectDraftUnitsAsOfReleaseControllerMessageQuery } from "@/modules/project";
import {
    ChatSessionViewChangesModal,
    postChatSessionUnitPreChatBaseByPaths,
    type ChatSessionUnitChangePair,
} from "@/modules/project-chat";
import { usePersistedUnitDiffViewMode } from "@/modules/project-chat/hooks/use-persisted-unit-diff-view-mode";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlignJustify, Columns2, FlaskConical, Rocket } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useAreBothSidebarsOpen } from "@/components/secondary-sidebar";
import {
    STALE_BASE_RELEASE_CONVERSATION_MESSAGE,
    useConversationStaleBaseRelease,
} from "../conversation-stale-base-release-context";
import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";
import { DeployReleaseToRuntimeModal } from "./deploy-release-to-runtime-modal";
import { getReleaseControllerPayload, useReleaseControllerRuntimeLiveFlags } from "./release-controller-box-shared";
import { ReleaseStageRuntimeModal } from "./release-stage-runtime-modal";

function uniqueUnitPathsFromDraftUnits(units: { id: string }[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of units) {
        const path = stableUnitIdForRevisionCache(u.id);
        if (seen.has(path)) continue;
        seen.add(path);
        out.push(path);
    }
    return out;
}

function viewChangesPairsFromPreChat(
    freshDraftUnits: ProjectUnitResponse[],
    unitPaths: string[],
    beforeUnits: (ProjectUnitResponse | null)[],
): ChatSessionUnitChangePair[] {
    const pairs: ChatSessionUnitChangePair[] = [];
    const n = Math.min(unitPaths.length, beforeUnits.length);
    for (let i = 0; i < n; i++) {
        const path = unitPaths[i]!;
        const beforeUnit = beforeUnits[i] ?? null;
        const afterUnit = freshDraftUnits.find((u) => stableUnitIdForRevisionCache(u.id) === path);
        if (afterUnit == null) continue;
        pairs.push({ beforeUnit, afterUnit });
    }
    return pairs;
}

export function ReleaseControllerBoxMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const { projectId, conversationId } = useParams<{ projectId: string; conversationId?: string }>();
    const chatSessionId = conversationId ?? undefined;
    const staleBaseRelease = useConversationStaleBaseRelease();
    const [diffViewMode] = usePersistedUnitDiffViewMode();
    const isMobile = useIsMobile();
    const bothSidebarsOpen = useAreBothSidebarsOpen();
    const compactToolbar = isMobile || bothSidebarsOpen;

    const { stage_release: stageRelease, prod_release: prodRelease } = getReleaseControllerPayload(message);

    const {
        data: draftUnits,
        isLoading,
        error,
        refetch: refetchDraftUnits,
    } = useProjectDraftUnitsAsOfReleaseControllerMessageQuery(projectId ?? undefined, chatSessionId, message.id);

    const [viewChangesOpen, setViewChangesOpen] = useState(false);
    const [viewChangesUnits, setViewChangesUnits] = useState<ChatSessionUnitChangePair[]>([]);
    const [isPreparingViewChanges, setIsPreparingViewChanges] = useState(false);
    const [stageReleaseModalOpen, setStageReleaseModalOpen] = useState(false);
    const [productionConfirmOpen, setProductionConfirmOpen] = useState(false);
    const [stageDeployRuntimePickOpen, setStageDeployRuntimePickOpen] = useState(false);
    const [productionRedeployConfirmOpen, setProductionRedeployConfirmOpen] = useState(false);
    const [prodRedeployRuntimeId, setProdRedeployRuntimeId] = useState<string | null>(null);

    const { stageRuntimes, prodRuntimes, isStageReleaseLiveOnRuntime, isProdReleaseLiveOnRuntime } =
        useReleaseControllerRuntimeLiveFlags(projectId, stageRelease, prodRelease);

    const stageRevisionNum = stageRelease?.revision ?? null;
    const prodRevisionNum = prodRelease?.revision ?? null;
    const stageReleaseId = stageRelease?.id ?? null;
    const prodReleaseId = prodRelease?.id ?? null;

    const queryClient = useQueryClient();

    const invalidateAfterRuntimeDeploy = useCallback(async () => {
        if (projectId == null || chatSessionId == null) return;
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleases(projectId) });
    }, [projectId, chatSessionId, queryClient]);

    const stageRedeployMutation = useMutation({
        mutationFn: async (runtimeId: string) => {
            if (projectId == null) throw new Error("Missing project");
            if (stageReleaseId == null) throw new Error("Missing stage release id");
            await postRuntimeDeployStageRelease(projectId, runtimeId, { release_id: stageReleaseId });
        },
        onSuccess: async () => {
            await invalidateAfterRuntimeDeploy();
            setStageDeployRuntimePickOpen(false);
            toast.success("Stage deploy has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start stage deploy.", { position: "top-center" });
        },
    });

    const prodRedeployMutation = useMutation({
        mutationFn: async (runtimeId: string) => {
            if (projectId == null) throw new Error("Missing project");
            if (prodReleaseId == null) throw new Error("Missing production release id");
            await postRuntimeDeployProductionRelease(projectId, runtimeId, { release_id: prodReleaseId });
        },
        onSuccess: async () => {
            setProductionRedeployConfirmOpen(false);
            setProdRedeployRuntimeId(null);
            await invalidateAfterRuntimeDeploy();
            toast.success("Production deploy has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start production deploy.", { position: "top-center" });
        },
    });

    const productionReleaseMutation = useMutation({
        mutationFn: () => {
            if (stageRelease?.id == null) throw new Error("Missing stage release id");
            return postReleaseControllerProductionRelease(projectId!, chatSessionId!, message.id, {
                stage_release_id: stageRelease.id,
            });
        },
        onSuccess: async () => {
            setProductionConfirmOpen(false);
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionMessages(projectId!, chatSessionId!) });
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId!) });
            toast.success("Production release process has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start production release.", { position: "top-center" });
        },
    });

    const hasDraftUnits = (draftUnits?.length ?? 0) > 0;
    const canViewChanges =
        projectId != null && chatSessionId != null && !isLoading && !error && hasDraftUnits && !isPreparingViewChanges;

    const handleViewChanges = useCallback(async () => {
        if (projectId == null || chatSessionId == null) return;
        setIsPreparingViewChanges(true);
        try {
            const refetchResult = await refetchDraftUnits();
            if (refetchResult.isError) {
                toast.error("Could not refresh draft units till this point.");
                return;
            }
            const fresh = refetchResult.data ?? [];
            if (fresh.length === 0) {
                toast.message("No draft units till this point.");
                return;
            }
            const unitPaths = uniqueUnitPathsFromDraftUnits(fresh);
            const preChat = await postChatSessionUnitPreChatBaseByPaths(projectId, chatSessionId, unitPaths);
            setViewChangesUnits(viewChangesPairsFromPreChat(fresh, unitPaths, preChat.units));
            setViewChangesOpen(true);
        } catch {
            toast.error("Could not load pre-chat unit versions till this point.");
        } finally {
            setIsPreparingViewChanges(false);
        }
    }, [projectId, chatSessionId, refetchDraftUnits]);

    const canOpenStageReleaseModal = projectId != null && chatSessionId != null && stageRelease == null;
    const canCallProductionRelease =
        stageRelease != null && prodRelease == null && projectId != null && chatSessionId != null;

    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);

    const handleStageRedeploy = useCallback(() => {
        if (stageReleaseId == null) return;
        if (stageRuntimes.length === 0) return;

        setStageDeployRuntimePickOpen(true);
    }, [stageReleaseId, stageRuntimes]);

    const handleProdRedeployClick = useCallback(() => {
        if (prodReleaseId == null) return;
        const prodRuntimeId = prodRuntimes[0]?.id;
        if (prodRuntimeId == null) return;
        setProdRedeployRuntimeId(prodRuntimeId);
        setProductionRedeployConfirmOpen(true);
    }, [prodReleaseId, prodRuntimes]);

    return (
        <>
            <div
                className={cn(
                    "relative overflow-hidden flex w-full min-w-0 max-w-full flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-400/25 bg-emerald-400/6 px-3 py-2.5 mb-4 dark:border-emerald-500/20 dark:bg-emerald-950/20",
                    !compactToolbar && "sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                )}
            >
                <ScrollHighlightOverlay
                    show={isScrollHighlight}
                    className="rounded-xl bg-emerald-500/30 dark:bg-emerald-400/25"
                />
                <p
                    className={cn(
                        "relative z-[1] w-full min-w-0 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400/90",
                        !compactToolbar && "sm:flex-1 sm:text-left",
                    )}
                >
                    Release scope up to here
                </p>
                <div
                    className={cn(
                        "relative z-[1] flex w-full min-w-0 flex-wrap items-center justify-center gap-2",
                        !compactToolbar && "sm:w-auto sm:justify-end",
                    )}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={!canViewChanges}
                        aria-busy={isPreparingViewChanges}
                        onClick={() => void handleViewChanges()}
                    >
                        {isPreparingViewChanges ? (
                            <>
                                <Spinner className="size-3" />
                                Loading…
                            </>
                        ) : (
                            <>
                                {diffViewMode === "split" ? (
                                    <Columns2 className="size-3" aria-hidden />
                                ) : (
                                    <AlignJustify className="size-3" aria-hidden />
                                )}
                                View changes
                            </>
                        )}
                    </Button>

                    {stageRelease != null ? (
                        isStageReleaseLiveOnRuntime ? (
                            <CompactReleaseBadge release={stageRelease} projectId={projectId} />
                        ) : (
                            projectId != null &&
                            stageRevisionNum != null &&
                            (stageRuntimes.length === 0 ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button type="button" variant="outline" size="xs" disabled>
                                                <FlaskConical className="size-3 shrink-0" aria-hidden />
                                                Deploy revision {stageRelease.revision} to stage
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">No stage runtimes available.</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="xs"
                                                disabled={stageRedeployMutation.isPending}
                                                aria-busy={stageRedeployMutation.isPending}
                                                onClick={() => void handleStageRedeploy()}
                                            >
                                                {stageRedeployMutation.isPending ? (
                                                    <>
                                                        <Spinner className="size-3" />
                                                        Deploying…
                                                    </>
                                                ) : (
                                                    <>
                                                        <FlaskConical className="size-3 shrink-0" aria-hidden />
                                                        Deploy revision {stageRelease.revision} to stage
                                                    </>
                                                )}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    {staleBaseRelease ? (
                                        <TooltipContent side="top">{STALE_BASE_RELEASE_CONVERSATION_MESSAGE}</TooltipContent>
                                    ) : null}
                                </Tooltip>
                            ))
                        )
                    ) : !canOpenStageReleaseModal ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button type="button" variant="outline" size="xs" disabled>
                                        Release Stage
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Missing project or conversation context.</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        onClick={() => setStageReleaseModalOpen(true)}
                                    >
                                        Release Stage
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {staleBaseRelease ? (
                                <TooltipContent side="top">{STALE_BASE_RELEASE_CONVERSATION_MESSAGE}</TooltipContent>
                            ) : null}
                        </Tooltip>
                    )}

                    {prodRelease != null ? (
                        isProdReleaseLiveOnRuntime ? (
                            <CompactReleaseBadge release={prodRelease} projectId={projectId} />
                        ) : (
                            projectId != null &&
                            prodRevisionNum != null &&
                            (prodRuntimes.length === 0 ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button type="button" variant="outline" size="xs" disabled>
                                                <Rocket className="size-3 shrink-0" aria-hidden />
                                                Deploy revision {prodRelease.revision} to production
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">No production runtimes available.</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="xs"
                                                disabled={prodRedeployMutation.isPending}
                                                aria-busy={prodRedeployMutation.isPending}
                                                onClick={() => void handleProdRedeployClick()}
                                            >
                                                {prodRedeployMutation.isPending ? (
                                                    <>
                                                        <Spinner className="size-3" />
                                                        Deploying…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Rocket className="size-3 shrink-0" aria-hidden />
                                                        Deploy revision {prodRelease.revision} to production
                                                    </>
                                                )}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    {staleBaseRelease ? (
                                        <TooltipContent side="top">{STALE_BASE_RELEASE_CONVERSATION_MESSAGE}</TooltipContent>
                                    ) : null}
                                </Tooltip>
                            ))
                        )
                    ) : stageRelease == null ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button type="button" variant="outline" size="xs" disabled>
                                        Release production
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Release to stage first.</TooltipContent>
                        </Tooltip>
                    ) : !canCallProductionRelease ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button type="button" variant="outline" size="xs" disabled>
                                        Release production
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Missing project or conversation context.</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        disabled={productionReleaseMutation.isPending}
                                        aria-busy={productionReleaseMutation.isPending}
                                        onClick={() => setProductionConfirmOpen(true)}
                                    >
                                        Release production
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {staleBaseRelease ? (
                                <TooltipContent side="top">{STALE_BASE_RELEASE_CONVERSATION_MESSAGE}</TooltipContent>
                            ) : null}
                        </Tooltip>
                    )}
                </div>
            </div>

            <AlertDialog open={productionConfirmOpen} onOpenChange={setProductionConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>I have tested, let&apos;s deploy</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    This starts a production release for the scope up to this message. Confirm only when you have
                                    tested on stage and are ready for these changes to go live.
                                </p>
                                {staleBaseRelease ? (
                                    <p className="text-amber-900 dark:text-amber-100/95">
                                        {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
                                    </p>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={productionReleaseMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                productionReleaseMutation.mutate();
                            }}
                            disabled={productionReleaseMutation.isPending}
                        >
                            {productionReleaseMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Releasing…
                                </>
                            ) : (
                                "Deploy to production"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={productionRedeployConfirmOpen}
                onOpenChange={(open) => {
                    setProductionRedeployConfirmOpen(open);
                    if (!open) setProdRedeployRuntimeId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Deploy revision {prodRelease?.revision ?? ""} to production?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    This deploys release revision {prodRelease?.revision ?? ""} to the production runtime. Confirm
                                    only when you have tested on stage and are ready for these changes to go live.
                                </p>
                                {staleBaseRelease ? (
                                    <p className="text-amber-900 dark:text-amber-100/95">
                                        {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
                                    </p>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={prodRedeployMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                if (prodRedeployRuntimeId == null) return;
                                prodRedeployMutation.mutate(prodRedeployRuntimeId);
                            }}
                            disabled={prodRedeployMutation.isPending || prodRedeployRuntimeId == null}
                        >
                            {prodRedeployMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Deploying…
                                </>
                            ) : (
                                <>
                                    Deploy revision {prodRelease?.revision ?? ""}
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {stageRevisionNum != null && stageReleaseId != null && (
                <DeployReleaseToRuntimeModal
                    open={stageDeployRuntimePickOpen}
                    onOpenChange={setStageDeployRuntimePickOpen}
                    projectId={projectId}
                    releaseId={stageReleaseId}
                    revision={stageRevisionNum}
                    revisionLabel={stageRelease != null ? String(stageRelease.revision) : ""}
                    onDeployRuntime={(runtimeId) => stageRedeployMutation.mutate(runtimeId)}
                    deployingRuntimeId={stageRedeployMutation.isPending ? stageRedeployMutation.variables ?? null : null}
                />
            )}

            <ReleaseStageRuntimeModal
                open={stageReleaseModalOpen}
                onOpenChange={setStageReleaseModalOpen}
                projectId={projectId}
                chatSessionId={chatSessionId}
                messageId={message.id}
            />
            <ChatSessionViewChangesModal
                open={viewChangesOpen}
                onOpenChange={setViewChangesOpen}
                unitsChanged={viewChangesUnits}
                projectId={projectId}
                chatSessionId={chatSessionId}
            />
            {nestedMessages}
        </>
    );
}
