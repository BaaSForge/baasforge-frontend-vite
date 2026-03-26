"use client";

import { ExpandableFullReadTrigger } from "@/components/expandable-full-read-trigger";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { CentricModal, CentricModalContent, CentricModalHeader } from "@/components/ui/centric-modal";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";
import { UnitCardIdRow, UNIT_CARD_ID_BADGE_RESERVE_CLASS } from "./unit-card-id-row";

export interface UnitCardChipProps {
    unit: ProjectUnitResponse;
    className?: string;
}

export function UnitCardChip({ unit, className }: UnitCardChipProps) {
    const hasParent = unit.revision > 1;
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim() ?? "No description";
    const summary = explanation.length > 60 ? explanation.slice(0, 60) + "..." : explanation;
    const [modalOpen, setModalOpen] = useState(false);

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
                    className="pointer-events-none absolute top-4 left-1 -right-1 bottom-0 z-0 rounded-md border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <div
                className={cn(
                    "relative z-[1] flex flex-col overflow-visible rounded-md border bg-muted/30 min-w-0 w-full bg-card",
                    hasParent && "mb-1",
                    isDeleted && "border-destructive",
                )}
                title={unit.explanation ?? undefined}
            >
                <UnitCardIdRow unitId={unit.id} className="z-3" />
                <div className="group/expandable-read relative flex flex-col gap-1 px-2.5 pt-4 pb-1.5">
                    <div className="flex flex-wrap items-center gap-1">
                        {isDeleted && (
                            <Badge variant="destructive" className="text-[0.625rem]" title="This unit has been removed">
                                Deleted
                            </Badge>
                        )}
                        <Badge variant="outline" className={cn("text-[0.625rem]", getProjectUnitTypeBadgeClass(unit.unit_type))}>
                            {unit.unit_type}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[0.625rem]">
                            {unit.revision}
                        </Badge>
                    </div>
                    <p className={cn("truncate text-[0.6875rem] text-muted-foreground", isDeleted && "line-through")}>{summary}</p>
                    <ExpandableFullReadTrigger ariaLabel="Show full explanation" onClick={() => setModalOpen(true)}>
                        Read full explanation
                    </ExpandableFullReadTrigger>
                </div>
                <CentricModal open={modalOpen} onOpenChange={setModalOpen}>
                    <CentricModalContent className="sm:max-w-[48rem] max-h-[85vh] flex flex-col" showCloseButton>
                        <CentricModalHeader className="flex flex-row gap-1">
                            {isDeleted && (
                                <Badge variant="destructive" className="text-[0.625rem]" title="This unit has been removed">
                                    Deleted
                                </Badge>
                            )}
                            <Badge variant="outline" className={cn("text-[0.625rem]", getProjectUnitTypeBadgeClass(unit.unit_type))}>
                                {unit.unit_type}
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[0.625rem]">
                                {unit.revision}
                            </Badge>
                        </CentricModalHeader>
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
            </div>
        </div>
    );
}
