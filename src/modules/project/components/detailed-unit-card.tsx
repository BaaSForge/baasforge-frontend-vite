"use client";

import { Markdown } from "@/components/markdown";
import { LiveBadge } from "@/components/live-badge";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsiblePanelTitle } from "@/components/ui/collapsible-panel-title";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChevronDown, Maximize2, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { LIVE_INTERACTION_NOTE_WHEN_NOT_LIVE } from "../live-interaction-notes";
import { useProjectQuery } from "../queries";
import { runtimeBaseUrlForUnitType, type ProjectUnitResponse } from "../types";
import { ApiUnitLiveInteraction } from "./api-unit-live-interaction";
import { UnitCardToolsDropdown } from "./unit-card-tools-dropdown";
import { UnitFullExplanationModal } from "./unit-full-explanation-modal";
import { UnitRejectedBadge } from "./unit-rejected-badge";
import { UnitRevisionBadge } from "./unit-revision-badge";
import { UnitTypeBadge } from "./unit-type-badge";

function LiveInteractionNotLiveWarningPopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-amber-700 hover:bg-amber-500/12 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-500/15 dark:hover:text-amber-50"
                    aria-label="Why live interaction is unavailable"
                >
                    <TriangleAlert className="size-3.5" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" className="max-w-sm text-sm leading-snug">
                {LIVE_INTERACTION_NOTE_WHEN_NOT_LIVE}
            </PopoverContent>
        </Popover>
    );
}

export type DetailedUnitCardProps = {
    unit: ProjectUnitResponse;
    projectId?: string;
    chatSessionId?: string;
    className?: string;
    unitRefreshPending?: boolean;
    showChatSessionOverflowMenu?: boolean;
    showDraftPublishedBadge?: boolean;
    preparePending?: boolean;
    /** Runtime id for stage trigger path; set on the runtime-scoped units route. */
    stageRuntimeId?: string;
    /** From the open release (`is_stage`); picks stage vs production trigger URL. */
    releaseIsStage?: boolean;
    releaseIsLive?: boolean;
};

export function DetailedUnitCard({
    unit,
    projectId,
    chatSessionId,
    className,
    unitRefreshPending,
    showChatSessionOverflowMenu,
    showDraftPublishedBadge = true,
    preparePending,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive = true,
}: DetailedUnitCardProps) {
    const hasParent = unit.revision > 1;
    const isDeleted = unit.is_deleted === true;
    const isRejected = unit.is_rejected === true;
    const trimmedExplanation = unit.explanation?.trim() ?? "";
    const explanationMarkdown = trimmedExplanation.length > 0 ? trimmedExplanation : "No description";
    const [modalOpen, setModalOpen] = useState(false);
    const [explanationOpen, setExplanationOpen] = useState(true);
    const [interactionOpen, setInteractionOpen] = useState(false);
    const sourceChatSessionId = unit.chat_session_id?.trim() ?? "";
    const showHeaderMenu =
        showChatSessionOverflowMenu === true && projectId != null && projectId !== "";

    const { data: projectDetail } = useProjectQuery(projectId);
    const unitRuntimeBaseUrl = useMemo(() => {
        const r = projectDetail?.runtimes;
        if (r == null) return undefined;
        return runtimeBaseUrlForUnitType(r, unit.unit_type);
    }, [projectDetail, unit.unit_type]);

    const headerActionIconButtonClassName =
        "bg-muted/45 hover:bg-muted/65 dark:bg-muted/35 dark:hover:bg-muted/55";

    const badges = (
        <>
            <UnitRevisionBadge
                unit={unit}
                projectId={projectId}
                chatSessionId={chatSessionId}
                refreshPending={unitRefreshPending}
            />
            <UnitTypeBadge unitType={unit.unit_type} />
            {isRejected ? <UnitRejectedBadge /> : null}
            {showDraftPublishedBadge ? (
                <LiveBadge
                    isOn={unit.is_draft === false}
                    offLabel="Not shipped"
                    offTitle="Not shipped"
                    onLabel="Live"
                    onTitle="Live"
                />
            ) : null}
        </>
    );

    return (
        <div className={cn("relative w-full min-w-0", className)} data-unit-card-stack>
            {hasParent && (
                <Card
                    className="pointer-events-none absolute top-1.5 left-1.5 right-0 bottom-0 z-0 rounded-lg border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <Card
                className={cn(
                    "relative gap-0 overflow-visible rounded-lg border p-0 shadow-none",
                    hasParent && "mb-1.5 mr-1.5",
                    isDeleted && "border-destructive",
                    !isDeleted && isRejected && "border-muted-foreground/40",
                    isRejected && "opacity-[0.88]",
                )}
                aria-busy={preparePending === true}
            >
                {preparePending ? (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/55 backdrop-blur-[1px]">
                        <Spinner className="size-4 text-muted-foreground" />
                    </div>
                ) : null}
                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <CopyableEntityIdBadge id={unit.id} className="max-w-full self-start" />
                        <div className="flex min-w-0 flex-wrap items-center gap-2">{badges}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className={cn("text-muted-foreground shrink-0", headerActionIconButtonClassName)}
                            aria-label="Full explanation"
                            disabled={preparePending === true}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModalOpen(true);
                            }}
                        >
                            <Maximize2 className="size-3" aria-hidden />
                        </Button>
                        {showHeaderMenu ? (
                            <UnitCardToolsDropdown
                                projectId={projectId}
                                sourceChatSessionId={sourceChatSessionId}
                                triggerClassName={headerActionIconButtonClassName}
                                extraMenuItems={
                                    sourceChatSessionId === "" ? (
                                        <DropdownMenuItem
                                            className="flex items-center gap-2 py-1.5 text-xs"
                                            disabled={preparePending === true}
                                            onClick={() => setModalOpen(true)}
                                        >
                                            <Maximize2 className="text-muted-foreground size-3 shrink-0" aria-hidden />
                                            Full explanation
                                        </DropdownMenuItem>
                                    ) : undefined
                                }
                            />
                        ) : null}
                    </div>
                </div>
                <div className="space-y-4 border-t px-3 py-3">
                    <Collapsible open={explanationOpen} onOpenChange={setExplanationOpen}>
                        <CollapsiblePanelTitle>Explanation note</CollapsiblePanelTitle>
                        <CollapsibleContent className="min-h-0">
                            <div className={cn(isDeleted && "line-through", isRejected && "opacity-90")}>
                                <Markdown
                                    key={unit.id}
                                    className={cn("prose prose-sm dark:prose-invert max-w-none pt-2")}
                                >
                                    {explanationMarkdown}
                                </Markdown>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    {releaseIsLive ? (
                        <Collapsible open={interactionOpen} onOpenChange={setInteractionOpen}>
                            <CollapsiblePanelTitle>Live interaction</CollapsiblePanelTitle>
                            <CollapsibleContent className="min-h-0">
                                <div className="mt-2">
                                    {unit.unit_type === "api" ? (
                                        <ApiUnitLiveInteraction
                                            unit={unit}
                                            stageRuntimeId={stageRuntimeId}
                                            releaseIsStage={releaseIsStage}
                                            projectRuntimeBaseUrl={unitRuntimeBaseUrl}
                                        />
                                    ) : (
                                        <div className="text-muted-foreground flex min-h-[6rem] items-center justify-center px-2 text-center text-xs">
                                            Live interaction for this unit type is not wired yet.
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ) : (
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0">
                            <div
                                className={cn(
                                    buttonVariants({ variant: "ghost", size: "sm" }),
                                    "pointer-events-none w-fit max-w-full cursor-not-allowed justify-start gap-1.5 bg-muted/40 text-left text-xs font-normal text-muted-foreground opacity-60",
                                )}
                                aria-disabled
                            >
                                <ChevronDown className="size-3.5 shrink-0 opacity-50" aria-hidden />
                                <span className="min-w-0 truncate">Live interaction</span>
                            </div>
                            <LiveInteractionNotLiveWarningPopover />
                        </div>
                    )}
                </div>
                <UnitFullExplanationModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    explanation={explanationMarkdown}
                    code={unit.code}
                    isDeleted={isDeleted}
                    isRejected={isRejected}
                    badges={badges}
                />
            </Card>
        </div>
    );
}
