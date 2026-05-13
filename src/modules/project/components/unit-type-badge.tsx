import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { NEUTRAL_PROJECT_UNIT_TYPE_BADGE_CLASS } from "../unit-type-badge-class";
import { UNIT_TYPE_ICONS } from "../unit-type-icons";
import type { ProjectUnitType } from "../types";

export function UnitTypeBadge({
    unitType,
    className,
    label,
}: {
    unitType: ProjectUnitType;
    className?: string;
    /** Defaults to capitalized `unitType`. */
    label?: ReactNode;
}) {
    const Icon = UNIT_TYPE_ICONS[unitType];
    const text = label ?? capitalizeFirstLetter(unitType);

    return (
        <Badge variant="outline" className={cn("text-[0.625rem]", NEUTRAL_PROJECT_UNIT_TYPE_BADGE_CLASS, className)}>
            <Icon className="size-3 shrink-0 opacity-90" aria-hidden />
            <span>{text}</span>
        </Badge>
    );
}

export { UNIT_TYPE_ICONS } from "../unit-type-icons";
