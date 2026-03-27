import type { ProjectUnitType } from "./types";

export const NEUTRAL_PROJECT_UNIT_TYPE_BADGE_CLASS =
    "gap-1 border-border/80 bg-muted/40 font-normal text-muted-foreground dark:bg-muted/30";

export function getProjectUnitTypeBadgeClass(type: ProjectUnitType): string {
    void type;
    return NEUTRAL_PROJECT_UNIT_TYPE_BADGE_CLASS;
}
