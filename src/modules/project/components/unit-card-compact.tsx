"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Card, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { UnitCardIdRow, UNIT_CARD_ID_BADGE_RESERVE_CLASS } from "./unit-card-id-row";
import { UnitTypeBadge } from "./unit-type-badge";
import { UnitFullExplanationModal } from "./unit-full-explanation-modal";
import { UnitCardToolsDropdown } from "./unit-card-tools-dropdown";
import { UnitRejectedBadge } from "./unit-rejected-badge";
import { UnitRevisionBadge } from "./unit-revision-badge";

export interface UnitCardCompactProps {
    unit: ProjectUnitResponse;
    projectId?: string;
    chatSessionId?: string;
    className?: string;
    unitRefreshPending?: boolean;
    /**
     * When true (e.g. units & releases page), shows a ⋮ menu with a link to the chat session
     * that created this unit when {@link ProjectUnitResponse.chat_session_id} is set.
     */
    showChatSessionOverflowMenu?: boolean;
    /** When false, hides the Published / Draft badge (e.g. conversation sidebar and inline tool messages). */
    showDraftPublishedBadge?: boolean;
}

export function UnitCardCompact({
    unit,
    projectId,
    chatSessionId,
    className,
    unitRefreshPending,
    showChatSessionOverflowMenu,
    showDraftPublishedBadge = true,
}: UnitCardCompactProps) {
    const hasParent = unit.revision > 1;
    const isDeleted = unit.is_deleted === true;
    const isRejected = unit.is_rejected === true;
    const explanation = unit.explanation?.trim() ?? "No description";
    const [modalOpen, setModalOpen] = useState(false);
    const sourceChatSessionId = unit.chat_session_id?.trim() ?? "";
    const hasOverflowTools =
        showChatSessionOverflowMenu === true && projectId != null && projectId !== "" && sourceChatSessionId !== "";

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
        <div className={cn("relative inline-block w-full min-w-0", UNIT_CARD_ID_BADGE_RESERVE_CLASS, className)}>
            {hasParent && (
                <Card
                    className="pointer-events-none absolute top-[calc(0.75rem+0.375rem)] left-1.5 right-0 bottom-0 z-0 rounded-lg border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <Card
                className={cn(
                    "relative z-[1] gap-0 overflow-visible rounded-lg border p-0 shadow-none",
                    hasParent && "mb-1.5 mr-1.5",
                    isDeleted && "border-destructive",
                    !isDeleted && isRejected && "border-muted-foreground/40",
                    isRejected && "opacity-[0.88]",
                )}
            >
                <UnitCardIdRow unitId={unit.id} className="z-3" />
                <Expandable
                    className="group/expandable-read relative overflow-hidden rounded-lg p-2 pt-3 text-xs"
                    maxLines={4}
                    bottomEdgeFade
                    bottomEdgeFadeFromClassName="from-card"
                    trigger={() => (
                        <ExpandableFullReadTrigger
                            ariaLabel="Expand full explanation"
                            onClick={() => setModalOpen(true)}
                            className="rounded-lg"
                        >
                            Expand
                        </ExpandableFullReadTrigger>
                    )}
                >
                    <div className={cn(isDeleted && "line-through")}>
                        {explanation}
                    </div>
                </Expandable>
                <UnitFullExplanationModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    explanation={explanation}
                    isDeleted={isDeleted}
                    isRejected={isRejected}
                    badges={badges}
                />
                <CardAction
                    className={cn(
                        "bg-muted/30 w-full flex flex-wrap items-center justify-start gap-2 border-t p-2",
                        hasOverflowTools ? "justify-between" : "justify-start",
                    )}
                >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{badges}</div>
                    {hasOverflowTools && projectId ? (
                        <div className="ml-auto flex shrink-0 items-center justify-end self-end">
                            <UnitCardToolsDropdown projectId={projectId} sourceChatSessionId={sourceChatSessionId} enabled />
                        </div>
                    ) : null}
                </CardAction>
            </Card>
        </div>
    );
}
