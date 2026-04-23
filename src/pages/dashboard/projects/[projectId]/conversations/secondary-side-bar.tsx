import {
    SecondarySidebarContent,
    SecondarySidebarStickyHeader,
} from "@/components/secondary-sidebar/secondary-sidebar-content";
import { SecondarySidebarReleaseControllerFooter } from "./secondary-sidebar-release-controller-footer";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { stableUnitIdForRevisionCache } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { UnitCardCompact, useProjectDraftUnitsQuery } from "@/modules/project";
import {
    ChatSessionViewChangesModal,
    postChatSessionUnitPreChatBaseByPaths,
    type ChatSessionUnitChangePair,
} from "@/modules/project-chat";
import { usePersistedUnitDiffViewMode } from "@/modules/project-chat/hooks/use-persisted-unit-diff-view-mode";
import { AlignJustify, Columns2, FileCode } from "lucide-react";
import type { ProjectUnitResponse } from "@/modules/project/types";
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

export function SecondarySideBar() {
    const { projectId, conversationId } = useParams<{
        projectId: string;
        conversationId?: string;
    }>();

    const chatSessionId = conversationId ?? undefined;

    const { data: draftUnits, isLoading, error, refetch: refetchDraftUnits } = useProjectDraftUnitsQuery(
        projectId ?? undefined,
        chatSessionId,
    );
    const [diffViewMode] = usePersistedUnitDiffViewMode();
    const [viewChangesOpen, setViewChangesOpen] = useState(false);
    const [viewChangesUnits, setViewChangesUnits] = useState<ChatSessionUnitChangePair[]>([]);
    const [viewChangesActiveUnitId, setViewChangesActiveUnitId] = useState<string | undefined>(undefined);
    const [isPreparingViewChanges, setIsPreparingViewChanges] = useState(false);
    const [preparingExpandUnitId, setPreparingExpandUnitId] = useState<string | null>(null);

    const hasDraftUnits = (draftUnits?.length ?? 0) > 0;
    const canViewChanges =
        projectId != null && chatSessionId != null && !isLoading && !error && hasDraftUnits && !isPreparingViewChanges;

    const openViewChangesModal = useCallback(
        async (initialAfterUnitId?: string) => {
            if (projectId == null || chatSessionId == null || isPreparingViewChanges) return;
            setIsPreparingViewChanges(true);
            setPreparingExpandUnitId(initialAfterUnitId ?? null);
            try {
                const refetchResult = await refetchDraftUnits();
                if (refetchResult.isError) {
                    toast.error("Could not refresh draft units.");
                    return;
                }
                const fresh = refetchResult.data ?? [];
                if (fresh.length === 0) {
                    toast.message("No draft units in this conversation anymore.");
                    return;
                }
                const unitPaths = uniqueUnitPathsFromDraftUnits(fresh);
                const preChat = await postChatSessionUnitPreChatBaseByPaths(projectId, chatSessionId, unitPaths);
                const pairs = viewChangesPairsFromPreChat(fresh, unitPaths, preChat.units);
                setViewChangesUnits(pairs);
                setViewChangesActiveUnitId(
                    initialAfterUnitId != null && pairs.some((p) => p.afterUnit.id === initialAfterUnitId)
                        ? initialAfterUnitId
                        : undefined,
                );
                setViewChangesOpen(true);
            } catch {
                toast.error("Could not load pre-chat unit versions.");
            } finally {
                setIsPreparingViewChanges(false);
                setPreparingExpandUnitId(null);
            }
        },
        [projectId, chatSessionId, refetchDraftUnits, isPreparingViewChanges],
    );

    const releaseFooter =
        projectId != null && chatSessionId != null ? (
            <SecondarySidebarReleaseControllerFooter projectId={projectId} chatSessionId={chatSessionId} />
        ) : null;

    return (
        <SecondarySidebarContent
            footer={releaseFooter}
            header={
                <SecondarySidebarStickyHeader className="flex items-center justify-between gap-2 border-b border-sidebar-border pb-[calc(1rem+1px)]">
                    <SectionTitle className="mb-0">Draft units</SectionTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={!canViewChanges}
                        aria-busy={isPreparingViewChanges}
                        onClick={() => void openViewChangesModal()}
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
                </SecondarySidebarStickyHeader>
            }
        >
            {projectId == null || chatSessionId == null ? (
                <div className="text-sm text-muted-foreground">Start the conversation to generate draft units by using AI.</div>
            ) : isLoading ? (
                <div className="flex flex-col gap-2" aria-busy="true">
                    <p className="sr-only">Loading draft units</p>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex min-h-[5.5rem] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20"
                        >
                            <Spinner className="size-4 text-muted-foreground" aria-hidden />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-sm text-destructive">Failed to load draft units.</div>
            ) : draftUnits == null || draftUnits.length === 0 ? (
                <div className="text-sm text-muted-foreground">No draft units in this conversation.</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {draftUnits.map((unit) => (
                        <UnitCardCompact
                            className="mb-2"
                            key={unit.id}
                            projectId={projectId}
                            chatSessionId={chatSessionId}
                            unit={unit}
                            onExpandFullRead={() => void openViewChangesModal(unit.id)}
                            preparePending={isPreparingViewChanges && preparingExpandUnitId === unit.id}
                        />
                    ))}
                </div>
            )}
            <ChatSessionViewChangesModal
                open={viewChangesOpen}
                onOpenChange={(open) => {
                    if (!open) setViewChangesActiveUnitId(undefined);
                    setViewChangesOpen(open);
                }}
                unitsChanged={viewChangesUnits}
                activeUnitId={viewChangesActiveUnitId}
            />
        </SecondarySidebarContent>
    );
}
