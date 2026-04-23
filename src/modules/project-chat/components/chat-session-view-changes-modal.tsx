"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import {
    CentricModal,
    CentricModalClose,
    CentricModalContent,
    CentricModalDescription,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UnitRevisionBadge } from "@/modules/project/components/unit-revision-badge";
import type { ProjectUnitResponse as ProjectUnit } from "@/modules/project/types";
import { XIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePersistedUnitDiffViewMode } from "../hooks/use-persisted-unit-diff-view-mode";
import { UnitDetailWithDiff } from "./unit-detail-with-diff";

const ALL_CONTEXTS_TAB_VALUE = "__all_contexts__";
const CONTEXT_TAB_VALUE_PREFIX = "ctx:" as const;

function contextTabValue(slug: string) {
    return `${CONTEXT_TAB_VALUE_PREFIX}${slug}`;
}

export type ChatSessionUnitChangePair = {
    beforeUnit: ProjectUnit | null;
    afterUnit: ProjectUnit;
};

type ChatSessionViewChangesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitsChanged: ChatSessionUnitChangePair[];
    /** If set, selects this `afterUnit.id` when the modal opens; otherwise the first item is selected. */
    activeUnitId?: string;
    /** When false, hides the Published / Draft badge in the unit header strip. */
    showDraftPublishedBadge?: boolean;
};

export function ChatSessionViewChangesModal({
    open,
    onOpenChange,
    unitsChanged,
    activeUnitId,
    showDraftPublishedBadge = true,
}: ChatSessionViewChangesModalProps) {
    const [tabUserOverride, setTabUserOverride] = useState<string | null>(null);
    const [contextFilter, setContextFilter] = useState<string>(ALL_CONTEXTS_TAB_VALUE);
    const [diffLayoutMode] = usePersistedUnitDiffViewMode();
    const isMobile = useIsMobile();

    const afterIds = useMemo(() => unitsChanged.map((u) => u.afterUnit.id), [unitsChanged]);

    const distinctContextSlugs = useMemo(() => {
        const set = new Set(unitsChanged.map((p) => p.afterUnit.context_slug));
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [unitsChanged]);

    const visiblePairs = useMemo(() => {
        if (contextFilter === ALL_CONTEXTS_TAB_VALUE) return unitsChanged;
        const slug = contextFilter.slice(CONTEXT_TAB_VALUE_PREFIX.length);
        return unitsChanged.filter((p) => p.afterUnit.context_slug === slug);
    }, [unitsChanged, contextFilter]);

    const visibleAfterIds = useMemo(() => visiblePairs.map((p) => p.afterUnit.id), [visiblePairs]);

    const defaultTabId = useMemo(() => {
        if (visiblePairs.length === 0) return "";
        return activeUnitId != null && visibleAfterIds.includes(activeUnitId) ? activeUnitId : visiblePairs[0]!.afterUnit.id;
    }, [visiblePairs, activeUnitId, visibleAfterIds]);

    const tabValue = useMemo(() => {
        if (!open || visiblePairs.length === 0) return "";
        if (tabUserOverride != null && visibleAfterIds.includes(tabUserOverride)) return tabUserOverride;
        return defaultTabId;
    }, [open, visiblePairs.length, tabUserOverride, visibleAfterIds, defaultTabId]);

    const handleModalOpenChange = (next: boolean) => {
        if (!next) {
            setTabUserOverride(null);
            setContextFilter(ALL_CONTEXTS_TAB_VALUE);
        }
        onOpenChange(next);
    };

    const handleContextFilterChange = (next: string) => {
        if (next === contextFilter) return;
        const nextVisibleIds =
            next === ALL_CONTEXTS_TAB_VALUE
                ? afterIds
                : unitsChanged
                      .filter((p) => p.afterUnit.context_slug === next.slice(CONTEXT_TAB_VALUE_PREFIX.length))
                      .map((p) => p.afterUnit.id);
        if (tabValue !== "" && nextVisibleIds.includes(tabValue)) {
            setTabUserOverride(tabValue);
        } else {
            setTabUserOverride(nextVisibleIds[0] ?? null);
        }
        setContextFilter(next);
    };

    const tabTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    useLayoutEffect(() => {
        if (!open || tabValue === "") return;
        const el = tabTriggerRefs.current.get(tabValue);
        if (!el) return;
        let cancelled = false;
        const outer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (cancelled) return;
                el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            });
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(outer);
        };
    }, [open, tabValue]);

    const splitView = !isMobile && diffLayoutMode === "split";
    const modalWidthClass = splitView
        ? "sm:max-w-[80vw]"
        : "sm:min-w-[min(100%,54rem)] sm:max-w-[max(60vw,54rem)]";

    return (
        <CentricModal open={open} onOpenChange={handleModalOpenChange}>
            <CentricModalContent fillViewport className={modalWidthClass} showCloseButton={false}>
                {unitsChanged.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No units to compare.</p>
                ) : (
                    <Tabs value={tabValue} onValueChange={setTabUserOverride} className="min-h-0 w-full gap-0">
                        <div className="sticky top-0 z-10 -mx-4 border-b bg-background px-4 pb-3 sm:-mx-6 sm:px-6">
                            <CentricModalTitle className="sr-only">Unit changes</CentricModalTitle>
                            <CentricModalDescription className="sr-only">
                                Compare JSON for each draft unit before this chat and its current draft state. Use the context tabs to filter
                                units, then use the unit tabs to switch units.
                            </CentricModalDescription>
                            <div className="mt-3 flex items-center gap-2">
                                <Tabs
                                    value={contextFilter}
                                    onValueChange={handleContextFilterChange}
                                    className="min-w-0 flex-1 gap-0"
                                >
                                    <FadedScrollArea
                                        orientation="horizontal"
                                        horizontalIntrinsicHeight
                                        hideScrollbar
                                        className="min-w-0 w-full max-w-full"
                                    >
                                        <TabsList className="h-auto min-h-9 w-max flex-nowrap justify-start gap-1.5 bg-muted p-[3px]">
                                            <TabsTrigger
                                                value={ALL_CONTEXTS_TAB_VALUE}
                                                className={cn(
                                                    "shrink-0 px-2.5 py-1.5 text-xs",
                                                    "text-muted-foreground",
                                                    "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md",
                                                    "dark:data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
                                                )}
                                            >
                                                All contexts
                                            </TabsTrigger>
                                            {distinctContextSlugs.map((slug) => (
                                                <TabsTrigger
                                                    key={slug}
                                                    value={contextTabValue(slug)}
                                                    title={slug}
                                                    className={cn(
                                                        "max-w-[min(12rem,55vw)] shrink-0 overflow-hidden text-ellipsis px-2.5 py-1.5 font-mono text-[10px] sm:max-w-[14rem]",
                                                        "text-muted-foreground",
                                                        "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md",
                                                        "dark:data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
                                                    )}
                                                >
                                                    {slug}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </FadedScrollArea>
                                </Tabs>
                                <CentricModalClose
                                    type="button"
                                    className="ring-offset-background focus:ring-ring text-muted-foreground hidden size-9 shrink-0 items-center justify-center self-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none md:inline-flex [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                >
                                    <XIcon />
                                    <span className="sr-only">Close</span>
                                </CentricModalClose>
                            </div>
                            <div className="mt-2 min-w-0">
                                <FadedScrollArea
                                    orientation="horizontal"
                                    horizontalIntrinsicHeight
                                    hideScrollbar
                                    className="min-w-0 w-full max-w-full"
                                >
                                    <TabsList className="h-auto min-h-10 w-max flex-nowrap justify-start gap-1.5 bg-muted p-[3px]">
                                        {visiblePairs.map((pair, tabIndex) => {
                                            const id = pair.afterUnit.id;
                                            const positionLabel = `${tabIndex + 1}/${visiblePairs.length}`;
                                            return (
                                                <TabsTrigger
                                                    key={id}
                                                    ref={(node) => {
                                                        if (node) tabTriggerRefs.current.set(id, node);
                                                        else tabTriggerRefs.current.delete(id);
                                                    }}
                                                    value={id}
                                                    aria-label={`Unit ${tabIndex + 1} of ${visiblePairs.length}, ${id}`}
                                                    className={cn(
                                                        "group !h-auto min-h-0 w-max shrink-0 flex-none flex-col items-start gap-1.5 px-2 py-2 text-xs sm:flex-row sm:items-center",
                                                        "text-muted-foreground",
                                                        "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md",
                                                        "dark:data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
                                                    )}
                                                >
                                                    <div className="flex min-w-0 max-w-full flex-row items-center">
                                                        <span
                                                            className="shrink-0 border-r border-border/70 pr-2 font-mono text-[10px] tabular-nums leading-none text-muted-foreground group-data-[state=active]:text-foreground"
                                                        >
                                                            {positionLabel}
                                                        </span>
                                                        <span
                                                            className="min-w-0 max-w-[min(6rem,38vw)] overflow-hidden whitespace-nowrap text-ellipsis pl-2 text-left font-mono text-[10px] leading-tight [direction:rtl] text-muted-foreground group-data-[state=active]:text-foreground sm:max-w-[7.5rem]"
                                                            title={id}
                                                        >
                                                            {id}
                                                        </span>
                                                    </div>
                                                    <UnitRevisionBadge
                                                        unit={pair.afterUnit}
                                                        beforeUnit={pair.beforeUnit}
                                                        projectId={pair.afterUnit.project_id}
                                                        chatSessionId={pair.afterUnit.chat_session_id ?? undefined}
                                                        className="shrink-0 px-1.5 py-0 text-[10px] font-medium"
                                                    />
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </FadedScrollArea>
                            </div>
                        </div>
                        {visiblePairs.map((pair) => {
                            const id = pair.afterUnit.id;
                            return (
                                <TabsContent key={id} value={id} className="mt-0 min-h-0 outline-none">
                                    <UnitDetailWithDiff
                                        currentUnit={pair.afterUnit}
                                        oldUnit={pair.beforeUnit}
                                        showDraftPublishedBadge={showDraftPublishedBadge}
                                    />
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                )}
            </CentricModalContent>
        </CentricModal>
    );
}
