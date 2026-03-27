import {
    SecondarySidebarContent,
    SecondarySidebarStickyHeader,
} from "@/components/secondary-sidebar/secondary-sidebar-content";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { stableUnitIdForRevisionCache } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { UnitCardCompact, useProjectDraftUnitsQuery } from "@/modules/project";
import { ChatSessionViewChangesModal, postChatSessionUnitPreChatBaseByPaths } from "@/modules/project-chat";
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

export function SecondarySideBar() {
    const { projectId, conversationId } = useParams<{
        projectId: string;
        conversationId?: string;
    }>();

    const chatSessionId = conversationId ?? undefined;

    const { data: draftUnits, isLoading, error, refetch: refetchDraftUnits } = useProjectDraftUnitsQuery(projectId ?? undefined, chatSessionId);
    const [viewChangesOpen, setViewChangesOpen] = useState(false);
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
                toast.error("Could not refresh draft units.");
                return;
            }
            const fresh = refetchResult.data ?? [];
            if (fresh.length === 0) {
                toast.message("No draft units in this conversation anymore.");
                return;
            }
            const unitPaths = uniqueUnitPathsFromDraftUnits(fresh);
            await postChatSessionUnitPreChatBaseByPaths(projectId, chatSessionId, unitPaths);
            setViewChangesOpen(true);
        } catch {
            toast.error("Could not load pre-chat unit versions.");
        } finally {
            setIsPreparingViewChanges(false);
        }
    }, [projectId, chatSessionId, refetchDraftUnits]);

    return (
        <SecondarySidebarContent
            header={
                <SecondarySidebarStickyHeader className="flex items-center justify-between gap-2 border-b border-sidebar-border pb-[calc(1rem+1px)]">
                    <SectionTitle className="mb-0">Draft units</SectionTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={!canViewChanges}
                        aria-busy={isPreparingViewChanges}
                        onClick={handleViewChanges}
                    >
                        {isPreparingViewChanges ? (
                            <>
                                <Spinner className="size-3" />
                                Loading…
                            </>
                        ) : (
                            "View changes"
                        )}
                    </Button>
                </SecondarySidebarStickyHeader>
            }
        >
            {projectId == null || chatSessionId == null ? (
                <div className="text-sm text-muted-foreground">Start the conversation to generate draft units by using AI.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading draft units…</div>
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
                        />
                    ))}
                </div>
            )}
            <ChatSessionViewChangesModal open={viewChangesOpen} onOpenChange={setViewChangesOpen} />
        </SecondarySidebarContent>
    );
}
