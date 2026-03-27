"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { stableUnitIdForRevisionCache } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { ReleaseCardChip, useProjectDraftUnitsQuery } from "@/modules/project";
import {
    ChatSessionViewChangesModal,
    postChatSessionUnitPreChatBaseByPaths,
    type ChatSessionUnitChangePair,
} from "@/modules/project-chat";
import { usePersistedUnitDiffViewMode } from "@/modules/project-chat/hooks/use-persisted-unit-diff-view-mode";
import type { ReleaseControllerBoxPayload } from "@/modules/project-chat/payloads";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { AlignJustify, Columns2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

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

function getReleaseControllerPayload(message: ChatMessageWithDeliveryStatus): ReleaseControllerBoxPayload {
    const p = message.payload as ReleaseControllerBoxPayload | undefined | null;
    if (p == null || typeof p !== "object") return {};
    return p;
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

    const { stage_release: stageRelease, prod_release: prodRelease } = getReleaseControllerPayload(message);

    const { data: draftUnits, isLoading, error, refetch: refetchDraftUnits } = useProjectDraftUnitsQuery(
        projectId ?? undefined,
        chatSessionId,
    );

    const [viewChangesOpen, setViewChangesOpen] = useState(false);
    const [viewChangesUnits, setViewChangesUnits] = useState<ChatSessionUnitChangePair[]>([]);
    const [isPreparingViewChanges, setIsPreparingViewChanges] = useState(false);

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

    const canReleaseProd = stageRelease != null && prodRelease == null;
    const prodButtonDisabled = prodRelease != null || !canReleaseProd;

    return (
        <>
            <div className="flex w-full min-w-0 max-w-full flex-col items-center gap-3 rounded-xl border border-border/80 bg-muted/25 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="w-full min-w-0 text-center text-sm text-muted-foreground sm:flex-1 sm:text-left">
                    Release scope up to here
                </p>
                <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
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
                        <div className="flex min-w-0 flex-col items-center gap-0.5 sm:items-start">
                            <span className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                                Stage
                            </span>
                            <ReleaseCardChip release={stageRelease} className="max-w-[min(100%,220px)]" />
                        </div>
                    ) : (
                        <Button type="button" variant="secondary" size="xs">
                            Release Stage
                        </Button>
                    )}

                    {prodRelease != null ? (
                        <div className="flex min-w-0 flex-col items-center gap-0.5 sm:items-start">
                            <span className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                                Production
                            </span>
                            <ReleaseCardChip release={prodRelease} className="max-w-[min(100%,220px)]" />
                        </div>
                    ) : stageRelease == null ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <Button type="button" variant="secondary" size="xs" disabled={prodButtonDisabled}>
                                        Release production
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Release to stage first.</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button type="button" variant="secondary" size="xs" disabled={prodButtonDisabled}>
                            Release production
                        </Button>
                    )}
                </div>
            </div>
            <ChatSessionViewChangesModal open={viewChangesOpen} onOpenChange={setViewChangesOpen} unitsChanged={viewChangesUnits} />
            {nestedMessages}
        </>
    );
}
