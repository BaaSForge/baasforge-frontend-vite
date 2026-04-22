"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { stableUnitIdForRevisionCache } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { useProjectDraftUnitsAsOfReleaseControllerMessageQuery } from "@/modules/project";
import {
    ChatSessionViewChangesModal,
    postChatSessionUnitPreChatBaseByPaths,
    type ChatSessionUnitChangePair,
} from "@/modules/project-chat";
import { usePersistedUnitDiffViewMode } from "@/modules/project-chat/hooks/use-persisted-unit-diff-view-mode";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { type ProjectUnitResponse } from "@/modules/project/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AlignJustify, Columns2, FileCode } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useAreBothSidebarsOpen } from "@/components/secondary-sidebar";
import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";
import { ReleaseControllerDeployModals } from "./release-controller-deploy-modals";
import { ReleaseControllerThreadProdRow } from "./release-controller-thread-prod-row";
import { ReleaseControllerThreadStageRow } from "./release-controller-thread-stage-row";
import { useReleaseControllerActions } from "./use-release-controller-actions";

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
    const [diffViewMode] = usePersistedUnitDiffViewMode();
    const isMobile = useIsMobile();
    const bothSidebarsOpen = useAreBothSidebarsOpen();
    const compactToolbar = isMobile || bothSidebarsOpen;

    const {
        data: draftUnits,
        isLoading,
        error,
        refetch: refetchDraftUnits,
    } = useProjectDraftUnitsAsOfReleaseControllerMessageQuery(projectId ?? undefined, chatSessionId, message.id);

    const [viewChangesOpen, setViewChangesOpen] = useState(false);
    const [viewChangesUnits, setViewChangesUnits] = useState<ChatSessionUnitChangePair[]>([]);
    const [isPreparingViewChanges, setIsPreparingViewChanges] = useState(false);

    const releaseActions = useReleaseControllerActions(message, projectId, chatSessionId);
    const { disabledDueToReject } = releaseActions;

    const hasDraftUnits = (draftUnits?.length ?? 0) > 0;
    const canViewChanges =
        projectId != null &&
        chatSessionId != null &&
        !isLoading &&
        !error &&
        hasDraftUnits &&
        !isPreparingViewChanges &&
        !disabledDueToReject;

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

    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);

    return (
        <>
            <div className="mb-4 flex w-full min-w-0 max-w-full flex-col gap-2">
                <div className={cn("flex min-w-0 flex-col gap-2", !compactToolbar && "sm:items-start")}>
                    <p
                        className={cn(
                            "text-center text-sm text-muted-foreground",
                            !compactToolbar && "sm:text-left",
                        )}
                    >
                        Release scope up to here
                    </p>
                    {disabledDueToReject ? (
                        <p
                            className={cn(
                                "text-center text-xs text-amber-800 dark:text-amber-200/90",
                                !compactToolbar && "sm:text-left",
                            )}
                        >
                            New releases are disabled for this scope because the step was rejected.
                        </p>
                    ) : null}
                </div>
                <div
                    className={cn(
                        "relative overflow-hidden flex w-full min-w-0 max-w-full flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-400/25 bg-emerald-400/6 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-950/20",
                        !compactToolbar && "sm:flex-row sm:items-center sm:justify-end sm:gap-3",
                    )}
                >
                    <ScrollHighlightOverlay
                        show={isScrollHighlight}
                        className="rounded-xl bg-emerald-500/30 dark:bg-emerald-400/25"
                    />
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
                                    ) : diffViewMode === "current" ? (
                                        <FileCode className="size-3" aria-hidden />
                                    ) : (
                                        <AlignJustify className="size-3" aria-hidden />
                                    )}
                                    View changes
                                </>
                            )}
                        </Button>
                        <ReleaseControllerThreadStageRow actions={releaseActions} projectId={projectId} />
                        <ReleaseControllerThreadProdRow actions={releaseActions} projectId={projectId} />
                    </div>
                </div>
            </div>

            <ReleaseControllerDeployModals
                message={message}
                projectId={projectId}
                chatSessionId={chatSessionId}
                actions={releaseActions}
            />
            <ChatSessionViewChangesModal
                open={viewChangesOpen}
                onOpenChange={setViewChangesOpen}
                unitsChanged={viewChangesUnits}
            />
            {nestedMessages}
        </>
    );
}
