"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";

export interface UnitCardChipProps {
    unit: ProjectUnitResponse;
    className?: string;
}

export function UnitCardChip({ unit, className }: UnitCardChipProps) {
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim();
    const summary = explanation ? (explanation.length > 60 ? explanation.slice(0, 60) + "…" : explanation) : "No description";

    return (
        <div
            className={cn(
                "flex shrink-0 flex-col gap-1 rounded-md border bg-muted/30 px-2.5 py-1.5 min-w-0 max-w-[200px]",
                isDeleted && "border-destructive",
                className,
            )}
            title={unit.explanation ?? undefined}
        >
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
                    {unit.version}
                </Badge>
            </div>
            <p className={cn("truncate text-[0.6875rem] text-muted-foreground", isDeleted && "line-through")}>{summary}</p>
        </div>
    );
}
