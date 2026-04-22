"use client";

import { LiveBadge } from "@/components/live-badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UnitCardIdRow } from "@/modules/project/components/unit-card-id-row";
import { UnitRevisionBadge } from "@/modules/project/components/unit-revision-badge";
import { UnitTypeBadge } from "@/modules/project/components/unit-type-badge";
import type { ProjectUnitResponse as ProjectUnit } from "@/modules/project/types";
import { usePersistedUnitDiffViewMode } from "../hooks/use-persisted-unit-diff-view-mode";
import { AlignJustify, Columns2, FileCode } from "lucide-react";
import { ChatSessionDiffNewerRevisionChip } from "./chat-session-diff-newer-revision-chip";
import { UnitExplanationCurrentViewer } from "./unit-explanation-current-viewer";
import { UnitExplanationDiffViewer } from "./unit-explanation-diff-viewer";

export type UnitDetailWithDiffProps = {
    currentUnit: ProjectUnit;
    oldUnit: ProjectUnit | null;
    showDraftPublishedBadge?: boolean;
    headerStickyTopClassName?: string;
    className?: string;
};

export function UnitDetailWithDiff({
    currentUnit,
    oldUnit,
    showDraftPublishedBadge = true,
    headerStickyTopClassName = "top-19 sm:top-15",
    className,
}: UnitDetailWithDiffProps) {
    const [diffLayoutMode, setDiffLayoutMode] = usePersistedUnitDiffViewMode();
    const isMobile = useIsMobile();
    const splitView = !isMobile && diffLayoutMode === "split";
    const projectId = currentUnit.project_id;
    const chatSessionId = currentUnit.chat_session_id ?? undefined;

    const mobileToggleValue: "inline" | "current" = diffLayoutMode === "current" ? "current" : "inline";

    return (
        <div className={cn("min-h-0 space-y-3", className)}>
            <div
                className={cn(
                    "sticky z-[9] -mx-4 flex flex-col gap-1.5 border-b border-border/60 bg-background/95 px-4 pt-3 pb-1.5 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90 sm:-mx-6 sm:px-6",
                    headerStickyTopClassName,
                )}
            >
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-1">
                            <UnitRevisionBadge
                                unit={currentUnit}
                                beforeUnit={oldUnit}
                                projectId={projectId}
                                chatSessionId={chatSessionId}
                                className="max-w-full min-w-0 shrink px-1.5 py-0 text-[10px] font-medium"
                            />
                            {chatSessionId != null && chatSessionId !== "" ? (
                                <ChatSessionDiffNewerRevisionChip
                                    unit={currentUnit}
                                    projectId={projectId}
                                    chatSessionId={chatSessionId}
                                    className="shrink-0 px-1.5 py-0 text-[10px] font-medium"
                                />
                            ) : null}
                        </div>
                        <UnitTypeBadge unitType={currentUnit.unit_type} />
                        {showDraftPublishedBadge ? (
                            <LiveBadge
                                isOn={currentUnit.is_draft === false}
                                offLabel="Not shipped"
                                offTitle="Not shipped"
                                onLabel="Live"
                                onTitle="Live"
                            />
                        ) : null}
                    </div>
                    {isMobile ? (
                        <ToggleGroup
                            type="single"
                            value={mobileToggleValue}
                            onValueChange={(v) => {
                                if (v === "inline" || v === "current") setDiffLayoutMode(v);
                            }}
                            variant="outline"
                            size="sm"
                            spacing={0}
                            className="h-7 w-fit shrink-0"
                            aria-label="Code view"
                        >
                            <ToggleGroupItem
                                value="inline"
                                aria-label="Inline diff"
                                className="h-6 min-w-0 gap-0.5 px-2 py-0 text-[10px] leading-none"
                            >
                                <AlignJustify className="size-2.5 shrink-0" aria-hidden />
                                Inline
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="current"
                                aria-label="Current code"
                                className="h-6 min-w-0 gap-0.5 px-2 py-0 text-[10px] leading-none"
                            >
                                <FileCode className="size-2.5 shrink-0" aria-hidden />
                                Current
                            </ToggleGroupItem>
                        </ToggleGroup>
                    ) : (
                        <ToggleGroup
                            type="single"
                            value={diffLayoutMode}
                            onValueChange={(v) => {
                                if (v === "split" || v === "inline" || v === "current") setDiffLayoutMode(v);
                            }}
                            variant="outline"
                            size="sm"
                            spacing={0}
                            className="h-7 w-fit shrink-0"
                            aria-label="Code view"
                        >
                            <ToggleGroupItem
                                value="split"
                                aria-label="Split diff"
                                className="h-6 min-w-0 gap-0.5 px-2 py-0 text-[10px] leading-none sm:px-1.5"
                            >
                                <Columns2 className="size-2.5 shrink-0" aria-hidden />
                                <span className="hidden sm:inline">Split</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="inline"
                                aria-label="Inline diff"
                                className="h-6 min-w-0 gap-0.5 px-2 py-0 text-[10px] leading-none sm:px-1.5"
                            >
                                <AlignJustify className="size-2.5 shrink-0" aria-hidden />
                                <span className="hidden sm:inline">Inline</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="current"
                                aria-label="Current code"
                                className="h-6 min-w-0 gap-0.5 px-2 py-0 text-[10px] leading-none sm:px-1.5"
                            >
                                <FileCode className="size-2.5 shrink-0" aria-hidden />
                                <span className="hidden sm:inline">Current</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    )}
                </div>
                <UnitCardIdRow variant="inline" unitId={currentUnit.id} />
            </div>
            {diffLayoutMode === "current" ? (
                <UnitExplanationCurrentViewer code={currentUnit.code} />
            ) : (
                <div className="rounded-lg border bg-muted/20 p-1">
                    <UnitExplanationDiffViewer
                        beforeExplanation={oldUnit?.code ?? null}
                        afterExplanation={currentUnit.code}
                        splitView={splitView}
                    />
                </div>
            )}
        </div>
    );
}
