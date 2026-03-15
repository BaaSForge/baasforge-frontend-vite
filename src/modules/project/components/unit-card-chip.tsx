"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse, ProjectUnitType } from "../types";

export interface UnitCardChipProps {
    unit: ProjectUnitResponse;
    className?: string;
}

function getTypeBadgeClass(type: ProjectUnitType): string {
    if (type === "controller") {
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
    return "bg-muted text-muted-foreground border-border";
}

export function UnitCardChip({ unit, className }: UnitCardChipProps) {
    const explanation = unit.explanation?.trim();
    const summary = explanation ? (explanation.length > 60 ? explanation.slice(0, 60) + "…" : explanation) : "No description";

    return (
        <div
            className={cn("flex shrink-0 flex-col gap-1 rounded-md border bg-muted/30 px-2.5 py-1.5 min-w-0 max-w-[200px]", className)}
            title={unit.explanation ?? undefined}
        >
            <div className="flex flex-wrap items-center gap-1">
                <Badge variant="outline" className={cn("text-[0.625rem]", getTypeBadgeClass(unit.unit_type))}>
                    {unit.unit_type}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[0.625rem]">
                    v{unit.version}
                </Badge>
            </div>
            <p className="truncate text-[0.6875rem] text-muted-foreground">{summary}</p>
        </div>
    );
}
