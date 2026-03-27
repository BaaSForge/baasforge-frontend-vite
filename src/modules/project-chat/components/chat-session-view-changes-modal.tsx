"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { LiveBadge } from "@/components/live-badge";
import {
    CentricModal,
    CentricModalClose,
    CentricModalContent,
    CentricModalDescription,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UnitCardIdRow } from "@/modules/project/components/unit-card-id-row";
import { UnitRevisionBadge } from "@/modules/project/components/unit-revision-badge";
import { UnitTypeBadge } from "@/modules/project/components/unit-type-badge";
import type { ProjectUnitResponse as ProjectUnit } from "@/modules/project/types";
import { AlignJustify, Columns2, XIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePersistedUnitDiffViewMode } from "../hooks/use-persisted-unit-diff-view-mode";
import { UnitExplanationDiffViewer } from "./unit-explanation-diff-viewer";

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
};

export function ChatSessionViewChangesModal({
    open,
    onOpenChange,
    unitsChanged,
    activeUnitId,
}: ChatSessionViewChangesModalProps) {
    const [tabUserOverride, setTabUserOverride] = useState<string | null>(null);
    const [diffLayoutMode, setDiffLayoutMode] = usePersistedUnitDiffViewMode();
    const isMobile = useIsMobile();

    const afterIds = useMemo(() => unitsChanged.map((u) => u.afterUnit.id), [unitsChanged]);

    const defaultTabId = useMemo(() => {
        if (unitsChanged.length === 0) return "";
        return activeUnitId != null && afterIds.includes(activeUnitId) ? activeUnitId : unitsChanged[0]!.afterUnit.id;
    }, [unitsChanged, activeUnitId, afterIds]);

    const tabValue = useMemo(() => {
        if (!open || unitsChanged.length === 0) return "";
        if (tabUserOverride != null && afterIds.includes(tabUserOverride)) return tabUserOverride;
        return defaultTabId;
    }, [open, unitsChanged.length, tabUserOverride, afterIds, defaultTabId]);

    const handleModalOpenChange = (next: boolean) => {
        if (!next) setTabUserOverride(null);
        onOpenChange(next);
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
        : "sm:min-w-[min(100%,36rem)] sm:max-w-[max(40vw,36rem)]";

    return (
        <CentricModal open={open} onOpenChange={handleModalOpenChange}>
            <CentricModalContent className={modalWidthClass} showCloseButton={false}>
                {unitsChanged.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No units to compare.</p>
                ) : (
                    <Tabs value={tabValue} onValueChange={setTabUserOverride} className="min-h-0 w-full gap-0">
                        <div className="sticky top-0 z-10 -mx-4 border-b bg-background px-4 pb-3 sm:-mx-6 sm:px-6">
                            <CentricModalTitle className="sr-only">Unit changes</CentricModalTitle>
                            <CentricModalDescription className="sr-only">
                                Compare JSON for each draft unit before this chat and its current draft state. Use the tabs to switch units.
                            </CentricModalDescription>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="min-w-0 flex-1">
                                    <FadedScrollArea
                                        orientation="horizontal"
                                        horizontalIntrinsicHeight
                                        hideScrollbar
                                        className="min-w-0 w-full max-w-full"
                                    >
                                        <TabsList className="h-auto min-h-7 w-max flex-nowrap justify-start gap-0.5 bg-muted p-[3px]">
                                            {unitsChanged.map((pair) => {
                                                const id = pair.afterUnit.id;
                                                return (
                                                    <TabsTrigger
                                                        key={id}
                                                        ref={(node) => {
                                                            if (node) tabTriggerRefs.current.set(id, node);
                                                            else tabTriggerRefs.current.delete(id);
                                                        }}
                                                        value={id}
                                                        className={cn(
                                                            "!h-auto min-h-0 w-max shrink-0 flex-none flex-col items-start gap-1 px-1.5 py-1 text-xs sm:flex-row sm:items-center",
                                                            "data-[state=active]:shadow-sm",
                                                        )}
                                                    >
                                                        <span
                                                            className="max-w-full truncate text-left font-mono text-[10px] leading-tight text-muted-foreground"
                                                            title={id}
                                                        >
                                                            {id}
                                                        </span>
                                                        <UnitRevisionBadge
                                                            unit={pair.afterUnit}
                                                            beforeUnit={pair.beforeUnit}
                                                            className="shrink-0 px-1.5 py-0 text-[10px] font-medium"
                                                        />
                                                    </TabsTrigger>
                                                );
                                            })}
                                        </TabsList>
                                    </FadedScrollArea>
                                </div>
                                <CentricModalClose
                                    type="button"
                                    className="ring-offset-background focus:ring-ring text-muted-foreground hidden size-9 shrink-0 items-center justify-center self-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none sm:inline-flex [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                >
                                    <XIcon />
                                    <span className="sr-only">Close</span>
                                </CentricModalClose>
                            </div>
                        </div>
                        {unitsChanged.map((pair) => {
                            const id = pair.afterUnit.id;
                            const after = pair.afterUnit;
                            return (
                                <TabsContent key={id} value={id} className="mt-0 min-h-0 space-y-3 outline-none">
                                    <div
                                        className={cn(
                                            "sticky z-[9] -mx-4 flex flex-col gap-1.5 border-b border-border/60 bg-background/95 px-4 pt-3 pb-1.5 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90 sm:-mx-6 sm:px-6",
                                            /* Sits below the unit-tabs sticky strip (~3.25–3.75rem) */
                                            "top-14 sm:top-[3.75rem]",
                                        )}
                                    >
                                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                                                <UnitRevisionBadge
                                                    unit={pair.afterUnit}
                                                    beforeUnit={pair.beforeUnit}
                                                    className="max-w-full min-w-0 shrink px-1.5 py-0 text-[10px] font-medium"
                                                />
                                                <UnitTypeBadge unitType={after.unit_type} />
                                                <LiveBadge
                                                    isOn={!after.is_draft}
                                                    offLabel="Draft"
                                                    offTitle="Draft, not ready"
                                                    onLabel="Published"
                                                    onTitle="Published, ready"
                                                />
                                            </div>
                                            {!isMobile ? (
                                                <ToggleGroup
                                                    type="single"
                                                    value={diffLayoutMode}
                                                    onValueChange={(v) => {
                                                        if (v === "split" || v === "inline") setDiffLayoutMode(v);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    spacing={2}
                                                    className="h-7 shrink-0 gap-2"
                                                    aria-label="Diff layout"
                                                >
                                                    <ToggleGroupItem
                                                        value="split"
                                                        aria-label="Split view"
                                                        className="h-6 min-w-0 gap-0.5 px-1.5 py-0 text-[10px] leading-none data-[spacing=0]:rounded-sm"
                                                    >
                                                        <Columns2 className="size-2.5 shrink-0" aria-hidden />
                                                        <span className="hidden sm:inline">Split</span>
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="inline"
                                                        aria-label="Inline view"
                                                        className="h-6 min-w-0 gap-0.5 px-1.5 py-0 text-[10px] leading-none data-[spacing=0]:rounded-sm"
                                                    >
                                                        <AlignJustify className="size-2.5 shrink-0" aria-hidden />
                                                        <span className="hidden sm:inline">Inline</span>
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            ) : null}
                                        </div>
                                        <UnitCardIdRow variant="inline" unitId={after.id} />
                                    </div>
                                    <div className="rounded-lg border bg-muted/20 p-1">
                                        <UnitExplanationDiffViewer
                                            beforeExplanation={pair.beforeUnit?.code ?? null}
                                            afterExplanation={pair.afterUnit.code}
                                            splitView={splitView}
                                        />
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                )}
            </CentricModalContent>
        </CentricModal>
    );
}
