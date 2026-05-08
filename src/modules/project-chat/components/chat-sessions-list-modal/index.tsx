"use client";

import { SelectionCornerPill } from "@/components/selection-corner-pill";
import { FreeformMultiCombobox } from "@/components/ui/freeform-multi-combobox";
import { FilterClearButton } from "@/components/ui/filter-clear-button";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { Item, ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ChatSessionListReleaseFilter } from "@/modules/project-chat/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useProjectChatSessionsInfiniteQuery, type ProjectChatSessionsListFilters } from "../../queries";
import type { ChatSessionResponse } from "../../types";
import { SessionLastMessageRow } from "./session-last-message-row";
import { SessionOwnershipChipsRow } from "./session-ownership-chips";
import { useChatSessionsModal, useChatSessionsModalState } from "./store";

function revisionForApi(raw: string): number | string {
    const t = raw.trim();
    if (t.length === 0) return t;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
    return t;
}

function buildListFilters(stageRevisions: string[], productionRevisions: string[], unitPaths: string[]): ProjectChatSessionsListFilters {
    const release_filters: ChatSessionListReleaseFilter[] = [
        ...stageRevisions
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
            .map((r) => ({ env: "stage" as const, revision: revisionForApi(r) })),
        ...productionRevisions
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
            .map((r) => ({ env: "prod" as const, revision: revisionForApi(r) })),
    ];
    const unit_filters = unitPaths.map((u) => u.trim()).filter((u) => u.length > 0);
    return { release_filters, unit_filters };
}

function SessionItem({
    projectId,
    session,
    onNavigate,
    pathname,
}: {
    projectId: string;
    session: ChatSessionResponse;
    onNavigate: () => void;
    pathname: string;
}) {
    const url = `/dashboard/projects/${projectId}/conversations/${session.id}`;
    const isCurrentChat = `${pathname}/`.startsWith(`${url}/`);

    return (
        <Item
            size="sm"
            className="items-stretch rounded-none border-0 p-0 [&_a:not([aria-current=page])]:hover:bg-transparent"
        >
            <Link
                to={url}
                onClick={onNavigate}
                aria-current={isCurrentChat ? "page" : undefined}
                className={cn(
                    "relative flex w-full min-w-0 flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-sm outline-none hover:bg-transparent",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    isCurrentChat
                        ? "overflow-visible border border-solid border-emerald-500 bg-emerald-50/60 shadow-lg hover:bg-emerald-50/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/40"
                        : "border-dashed border-border",
                )}
            >
                {isCurrentChat ? (
                    <SelectionCornerPill side="left">Active session</SelectionCornerPill>
                ) : null}
                <div className="flex w-full min-w-0 justify-end">
                    <div
                        className={cn(
                            "max-w-[80%] min-w-0 border-r border-border px-3 py-1.5 text-right text-xs font-medium leading-snug text-foreground",
                            "line-clamp-2",
                        )}
                    >
                        {session.title || "Untitled"}
                    </div>
                </div>
                <SessionLastMessageRow lastMessage={session.last_message} />
                <SessionOwnershipChipsRow
                    projectId={projectId}
                    chatSessionId={session.id}
                    ownedReleases={session.owned_releases}
                    ownedUnits={session.owned_units}
                    suppressReleaseLinks
                />
            </Link>
        </Item>
    );
}

function ChatSessionsListModalInner({
    projectId,
    pathname,
    onClose,
}: {
    projectId: string;
    pathname: string;
    onClose: () => void;
}) {
    const [stageReleaseRevisions, setStageReleaseRevisions] = useState<string[]>([]);
    const [productionReleaseRevisions, setProductionReleaseRevisions] = useState<string[]>([]);
    const [unitIdOrPaths, setUnitIdOrPaths] = useState<string[]>([]);

    const listFilters = useMemo(
        () => buildListFilters(stageReleaseRevisions, productionReleaseRevisions, unitIdOrPaths),
        [stageReleaseRevisions, productionReleaseRevisions, unitIdOrPaths],
    );

    const {
        data,
        isLoading,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useProjectChatSessionsInfiniteQuery(projectId, listFilters, { enabled: true });

    const sessions = useMemo(() => data?.pages.flatMap((p) => p.sessions) ?? [], [data]);
    const total = data?.pages[0]?.total ?? 0;

    const scrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = scrollRef.current;
        const target = sentinelRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return;
                if (!hasNextPage || isFetchingNextPage) return;
                void fetchNextPage();
            },
            { root, rootMargin: "100px", threshold: 0 },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, sessions.length]);

    const clearFilters = useCallback(() => {
        setStageReleaseRevisions([]);
        setProductionReleaseRevisions([]);
        setUnitIdOrPaths([]);
    }, []);

    const hasActiveFilters =
        listFilters.release_filters.length > 0 || listFilters.unit_filters.length > 0;

    return [
        <CentricModalHeader key="chat-sessions-header">
            <CentricModalTitle className="md:pt-6 md:pb-4">
                Chat sessions
                {!isLoading && !isError ? (
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                        {total === 1 ? "1 session" : `${total} sessions`}
                        {hasActiveFilters ? " (filtered)" : ""}
                    </span>
                ) : null}
            </CentricModalTitle>
        </CentricModalHeader>,
        <div key="chat-sessions-body" className="flex min-h-0 flex-1 flex-col">
            <div
                className={cn(
                    "grid shrink-0 grid-cols-2 gap-3 border-b border-border pb-3",
                    hasActiveFilters
                        ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                        : "md:grid-cols-3",
                )}
            >
                <FreeformMultiCombobox
                    id={`chat-sessions-filter-stage-${projectId}`}
                    label="Stage release revision"
                    placeholder="Revision, then Enter"
                    value={stageReleaseRevisions}
                    onValueChange={setStageReleaseRevisions}
                />
                <FreeformMultiCombobox
                    id={`chat-sessions-filter-prod-${projectId}`}
                    label="Production release revision"
                    placeholder="Revision, then Enter"
                    value={productionReleaseRevisions}
                    onValueChange={setProductionReleaseRevisions}
                />
                <FreeformMultiCombobox
                    id={`chat-sessions-filter-units-${projectId}`}
                    className="col-span-2 md:col-span-1"
                    label="Unit id or path"
                    placeholder="Id or path, then Enter"
                    value={unitIdOrPaths}
                    onValueChange={setUnitIdOrPaths}
                />
                {hasActiveFilters ? (
                    <div className="col-span-2 flex items-end justify-end md:col-span-1">
                        <FilterClearButton onClear={clearFilters} />
                    </div>
                ) : null}
            </div>
            {isLoading ? (
                <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center gap-2 py-12 text-sm">
                    <Spinner className="size-5" />
                    Loading…
                </div>
            ) : isError ? (
                <div className="text-destructive flex min-h-0 flex-1 items-center justify-center px-2 py-8 text-center text-sm">
                    {error instanceof Error ? error.message : "Could not load sessions."}
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center py-8 text-center text-sm">
                    {hasActiveFilters ? "No sessions match these filters." : "No chat sessions yet."}
                </div>
            ) : (
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pt-3">
                    <ItemGroup className="gap-3">
                        {sessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                projectId={projectId}
                                session={session}
                                onNavigate={onClose}
                                pathname={pathname}
                            />
                        ))}
                    </ItemGroup>
                    <div ref={sentinelRef} className="flex min-h-12 items-center justify-center py-2" aria-hidden>
                        {isFetchingNextPage ? <Spinner className="size-5 text-muted-foreground" /> : null}
                    </div>
                </div>
            )}
        </div>,
    ];
}

export function ChatSessionsListModal() {
    const { pathname } = useLocation();
    const { isOpen, projectId } = useChatSessionsModalState();
    const [, close] = useChatSessionsModal();

    const handleOpenChange = (open: boolean) => {
        if (!open) close();
    };

    return (
        <CentricModal open={isOpen} onOpenChange={handleOpenChange}>
            <CentricModalContent bodyScroll={false} tallMobileSheet className="sm:max-w-4xl">
                {projectId != null && isOpen ? (
                    <ChatSessionsListModalInner
                        key={projectId}
                        projectId={projectId}
                        pathname={pathname}
                        onClose={close}
                    />
                ) : (
                    [
                        <CentricModalHeader key="chat-sessions-header-fallback">
                            <CentricModalTitle>Chat sessions</CentricModalTitle>
                        </CentricModalHeader>,
                        <div key="chat-sessions-body-fallback" className="flex min-h-0 flex-1 flex-col" />,
                    ]
                )}
            </CentricModalContent>
        </CentricModal>
    );
}
