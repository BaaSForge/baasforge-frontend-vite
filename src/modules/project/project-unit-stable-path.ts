import type { ProjectUnitResponse } from "./types";

export function projectUnitStablePath(
    unit: Pick<ProjectUnitResponse, "context_slug" | "module_slug" | "unit_name_slug" | "unit_type">,
): string {
    return `${unit.context_slug}.${unit.module_slug}.${unit.unit_type}.${unit.unit_name_slug}`;
}
