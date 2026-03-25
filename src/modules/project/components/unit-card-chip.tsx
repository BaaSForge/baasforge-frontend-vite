"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";
import { UnitCardIdRow } from "./unit-card-id-row";

export interface UnitCardChipProps {
    unit: ProjectUnitResponse;
    className?: string;
}

export function UnitCardChip({ unit, className }: UnitCardChipProps) {
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim();
    const summary = explanation ? (explanation.length > 60 ? explanation.slice(0, 60) + "…" : explanation) : "No description";

    return (
        <div className={cn("relative inline-block shrink-0 min-w-0 max-w-[200px] pt-3", className)}>
            <div
                className={cn(
                    "relative flex flex-col overflow-visible rounded-md border bg-muted/30 min-w-0 w-full",
                    isDeleted && "border-destructive",
                )}
                title={unit.explanation ?? undefined}
            >
                <UnitCardIdRow unitId={unit.id} />
                <div className="flex flex-col gap-1 px-2.5 pt-4 pb-1.5">
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
                </div>
            </div>
        </div>
    );
}
