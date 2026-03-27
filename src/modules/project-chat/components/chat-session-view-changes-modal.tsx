"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CentricModal,
    CentricModalClose,
    CentricModalContent,
    CentricModalDescription,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse as ProjectUnit } from "@/modules/project/types";
import { Sparkles, XIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

function unitChangeBadge(pair: ChatSessionUnitChangePair): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    showNewSparkles: boolean;
} {
    const { beforeUnit, afterUnit } = pair;
    if (afterUnit.is_deleted) {
        const label = beforeUnit == null ? "New → Deleted" : `Revision ${beforeUnit.revision} → Deleted`;
        return { label, variant: "destructive", showNewSparkles: false };
    }
    if (beforeUnit == null) {
        return { label: "New", variant: "outline", showNewSparkles: true };
    }
    return {
        label: `Revision ${beforeUnit.revision} → ${afterUnit.revision}`,
        variant: "outline",
        showNewSparkles: false,
    };
}

export function ChatSessionViewChangesModal({
    open,
    onOpenChange,
    unitsChanged,
    activeUnitId,
}: ChatSessionViewChangesModalProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

    const afterIds = useMemo(() => unitsChanged.map((u) => u.afterUnit.id), [unitsChanged]);

    useEffect(() => {
        if (!open || unitsChanged.length === 0) return;
        const next =
            activeUnitId != null && afterIds.includes(activeUnitId) ? activeUnitId : unitsChanged[0]!.afterUnit.id;
        setSelectedUnitId(next);
    }, [open, unitsChanged, activeUnitId, afterIds]);

    const tabValue = selectedUnitId ?? unitsChanged[0]?.afterUnit.id ?? "";

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

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[80vw]" showCloseButton={false}>
                {unitsChanged.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No units to compare.</p>
                ) : (
                    <Tabs value={tabValue} onValueChange={setSelectedUnitId} className="min-h-0 w-full gap-0">
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
                                                const { label, variant, showNewSparkles } = unitChangeBadge(pair);
                                                return (
                                                    <TabsTrigger
                                                        key={id}
                                                        ref={(node) => {
                                                            if (node) tabTriggerRefs.current.set(id, node);
                                                            else tabTriggerRefs.current.delete(id);
                                                        }}
                                                        value={id}
                                                        className={cn(
                                                            "!h-auto min-h-0 max-w-[min(100%,18rem)] shrink-0 flex-none flex-col items-start gap-1 px-1.5 py-1 text-xs sm:flex-row sm:items-center",
                                                            "data-[state=active]:shadow-sm [&_svg]:size-3",
                                                        )}
                                                    >
                                                        <span
                                                            className="max-w-full truncate text-left font-mono text-[10px] leading-tight text-muted-foreground"
                                                            title={id}
                                                        >
                                                            {id}
                                                        </span>
                                                        <Badge
                                                            variant={variant}
                                                            className={cn(
                                                                "max-w-full shrink-0 px-1.5 py-0 text-[10px] font-medium",
                                                                showNewSparkles &&
                                                                    "border-transparent bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
                                                            )}
                                                        >
                                                            {showNewSparkles && (
                                                                <Sparkles
                                                                    className="text-blue-600 dark:text-blue-400"
                                                                    aria-hidden
                                                                />
                                                            )}
                                                            <span className="truncate">{label}</span>
                                                        </Badge>
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
                            return (
                                <TabsContent key={id} value={id} className="mt-0 space-y-4 outline-none">
                                    <Card className="gap-4 py-4">
                                        <CardHeader className="gap-2 px-6 pb-0">
                                            <CardTitle className="text-base">Before</CardTitle>
                                            <CardDescription>Snapshot before this chat (pre-chat base).</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-6 font-mono text-xs">
                                            <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3">
                                                {JSON.stringify(pair.beforeUnit, null, 2)}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                    <Card className="gap-4 py-4">
                                        <CardHeader className="gap-2 px-6 pb-0">
                                            <CardTitle className="text-base">After</CardTitle>
                                            <CardDescription>Current draft in this conversation.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-6 font-mono text-xs">
                                            <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3">
                                                {JSON.stringify(pair.afterUnit, null, 2)}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                )}
            </CentricModalContent>
        </CentricModal>
    );
}
