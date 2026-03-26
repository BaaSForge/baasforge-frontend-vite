"use client";

import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";
import { UnitCardIdRow, UNIT_CARD_ID_BADGE_RESERVE_CLASS } from "./unit-card-id-row";
import { UnitFullExplanationModal } from "./unit-full-explanation-modal";
import { UnitRevisionBadge } from "./unit-revision-badge";

export interface UnitCardChipProps {
    unit: ProjectUnitResponse;
    projectId?: string;
    chatSessionId?: string;
    className?: string;
    unitRefreshPending?: boolean;
}

export function UnitCardChip({ unit, projectId, chatSessionId, className, unitRefreshPending }: UnitCardChipProps) {
    const hasParent = unit.revision > 1;
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim() ?? "No description";
    const summary = explanation.length > 60 ? explanation.slice(0, 60) + "..." : explanation;
    const [modalOpen, setModalOpen] = useState(false);

    const badges = (
        <>
            <Badge variant="outline" className={cn("text-[0.625rem]", getProjectUnitTypeBadgeClass(unit.unit_type))}>
                {unit.unit_type}
            </Badge>
            <UnitRevisionBadge
                unit={unit}
                projectId={projectId}
                chatSessionId={chatSessionId}
                refreshPending={unitRefreshPending}
            />
        </>
    );

    return (
        <div
            className={cn(
                "relative inline-block shrink-0 min-w-0 max-w-[200px]",
                UNIT_CARD_ID_BADGE_RESERVE_CLASS,
                className,
            )}
        >
            {hasParent && (
                <div
                    className="pointer-events-none absolute top-4 left-1 -right-1 bottom-0 z-0 rounded-lg border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <div
                className={cn(
                    "relative z-[1] flex flex-col overflow-visible rounded-lg border bg-muted/30 min-w-0 w-full bg-card",
                    hasParent && "mb-1",
                    isDeleted && "border-destructive",
                )}
                title={unit.explanation ?? undefined}
            >
                <UnitCardIdRow unitId={unit.id} className="z-3" />
                <div className="group/expandable-read relative flex flex-col gap-1 overflow-hidden rounded-b-lg px-2.5 pt-4 pb-1.5">
                    <div className="flex flex-wrap items-center gap-1">{badges}</div>
                    <p className={cn("truncate text-[0.6875rem] text-muted-foreground", isDeleted && "line-through")}>{summary}</p>
                    <ExpandableFullReadTrigger
                        ariaLabel="Expand full explanation"
                        onClick={() => setModalOpen(true)}
                        className="rounded-b-lg rounded-t-none"
                    >
                        Expand
                    </ExpandableFullReadTrigger>
                </div>
                <UnitFullExplanationModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    explanation={explanation}
                    isDeleted={isDeleted}
                    badges={badges}
                />
            </div>
        </div>
    );
}
