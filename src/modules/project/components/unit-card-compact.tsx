"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction } from "@/components/ui/card";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";
import { UnitCardIdRow, UNIT_CARD_ID_BADGE_RESERVE_CLASS } from "./unit-card-id-row";
import { UnitFullExplanationModal } from "./unit-full-explanation-modal";
import { UnitRevisionBadge } from "./unit-revision-badge";

export interface UnitCardCompactProps {
    unit: ProjectUnitResponse;
    className?: string;
    unitRefreshPending?: boolean;
}

export function UnitCardCompact({ unit, className, unitRefreshPending }: UnitCardCompactProps) {
    const hasParent = unit.revision > 1;
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim() ?? "No description";
    const [modalOpen, setModalOpen] = useState(false);

    const badges = (
        <>
            {isDeleted && (
                <Badge variant="destructive" className="text-[0.625rem]" title="This unit has been removed">
                    Deleted
                </Badge>
            )}
            <UnitRevisionBadge unit={unit} refreshPending={unitRefreshPending} />
            <Badge variant="outline" className={cn("text-[0.625rem]", getProjectUnitTypeBadgeClass(unit.unit_type))}>
                {capitalizeFirstLetter(unit.unit_type)}
            </Badge>
            <LiveBadge isOn={!unit.is_draft} offLabel="Draft" offTitle="Draft, not ready" onLabel="Published" onTitle="Published, ready" />
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
                )}
            >
                <UnitCardIdRow unitId={unit.id} className="z-3" />
                <Expandable
                    className="group/expandable-read relative overflow-hidden rounded-lg p-2 pt-3 text-xs"
                    maxLines={4}
                    bottomEdgeFade
                    bottomEdgeFadeFromClassName="from-card"
                    trigger={(_isOpen, _setOpen) => (
                        <ExpandableFullReadTrigger
                            ariaLabel="Show full description"
                            onClick={() => setModalOpen(true)}
                            className="rounded-lg"
                        >
                            Read full explanation
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
                    badges={badges}
                />
                <CardAction className="bg-muted/30 w-full flex items-center justify-start p-2 gap-2 border-t">{badges}</CardAction>
            </Card>
        </div>
    );
}
