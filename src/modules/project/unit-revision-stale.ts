import type { ProjectUnitResponse } from "./types";

export function isUnitRevisionStale(unit: ProjectUnitResponse): boolean {
    return unit.latest_revision != null && unit.revision < unit.latest_revision;
}
