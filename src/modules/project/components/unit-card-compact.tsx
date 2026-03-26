"use client";

import { Expandable } from "@/components/expandable";
import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { LiveBadge } from "@/components/live-badge";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction } from "@/components/ui/card";
import { CentricModal, CentricModalContent, CentricModalHeader } from "@/components/ui/centric-modal";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";
import { UnitCardIdRow, UNIT_CARD_ID_BADGE_RESERVE_CLASS } from "./unit-card-id-row";

export interface UnitCardCompactProps {
    unit: ProjectUnitResponse;
    className?: string;
}

export function UnitCardCompact({ unit, className }: UnitCardCompactProps) {
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
            <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 border-blue-500/30 text-[0.625rem]" title={`Revision ${unit.revision}`}>
                {unit.revision}
            </Badge>
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
                    className="pointer-events-none absolute top-[calc(0.75rem+0.375rem)] left-1.5 right-0 bottom-0 z-0 rounded-xl border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <Card
                className={cn(
                    "relative z-[1] gap-0 overflow-visible rounded-xl border p-0 shadow-none",
                    hasParent && "mb-1.5 mr-1.5",
                    isDeleted && "border-destructive",
                )}
            >
                <UnitCardIdRow unitId={unit.id} className="z-3" />
                <Expandable
                    className="group/expandable-read relative p-2 pt-3 text-xs"
                    maxLines={4}
                    bottomEdgeFade
                    bottomEdgeFadeFromClassName="from-card"
                    trigger={(_isOpen, _setOpen, isOverflowing) =>
                        isOverflowing && (
                            <ExpandableFullReadTrigger ariaLabel="Show full description" onClick={() => setModalOpen(true)}>
                                Read full explanation
                            </ExpandableFullReadTrigger>
                        )
                    }
                >
                    <div className={cn(isDeleted && "line-through")}>
                        {explanation}
                    </div>
                </Expandable>
                <CentricModal open={modalOpen} onOpenChange={setModalOpen}>
                    <CentricModalContent className="sm:max-w-[48rem] max-h-[85vh] flex flex-col" showCloseButton>
                        <CentricModalHeader className="flex flex-row">{badges}</CentricModalHeader>
                        <div
                            className={cn(
                                "prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[70vh] pr-2",
                                isDeleted && "line-through",
                            )}
                        >
                            <Markdown>{explanation}</Markdown>
                        </div>
                    </CentricModalContent>
                </CentricModal>
                <CardAction className="bg-muted/30 w-full flex items-center justify-start p-2 gap-2 border-t">{badges}</CardAction>
            </Card>
        </div>
    );
}
