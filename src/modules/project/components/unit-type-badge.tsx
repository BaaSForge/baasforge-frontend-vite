import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
    Cpu,
    GitBranch,
    Layers,
    Network,
    Plug2,
    Rocket,
    Search,
    Table2,
    Terminal,
    Timer,
    Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { NEUTRAL_PROJECT_UNIT_TYPE_BADGE_CLASS } from "../unit-type-badge-class";
import type { ProjectUnitType } from "../types";

const UNIT_TYPE_ICONS = {
    action: Zap,
    api: Plug2,
    bootstrap: Rocket,
    command: Terminal,
    flow: GitBranch,
    gateway: Network,
    projection: Layers,
    query: Search,
    runtime: Cpu,
    schema: Table2,
    timer: Timer,
} as const satisfies Record<ProjectUnitType, LucideIcon>;

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
