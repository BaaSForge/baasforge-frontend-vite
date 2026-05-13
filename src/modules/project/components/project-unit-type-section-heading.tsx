import { capitalizeFirstLetter, cn } from "@/lib/utils";
import type { ProjectUnitType } from "@/modules/project/types";
import { UNIT_TYPE_ICONS } from "@/modules/project/unit-type-icons";

export function ProjectUnitTypeSectionHeading({
    unitType,
    className,
}: {
    unitType: ProjectUnitType;
    className?: string;
}) {
    const Icon = UNIT_TYPE_ICONS[unitType];
    return (
        <h2
            className={cn(
                "mb-3 flex min-h-10 items-center gap-2.5 text-base font-semibold tracking-tight text-foreground",
                className,
            )}
        >
            <Icon className="text-muted-foreground size-5 shrink-0" aria-hidden />
            <span className="text-foreground">{capitalizeFirstLetter(unitType)}</span>
        </h2>
    );
}
