import type { ProjectUnitResponse } from "./types";

/**
 * @param latestKnown — when set (e.g. from `chatSessionUnitLatestRevisionsByUnitId` cache), used instead of `unit.latest_revision`.
 */
export function isUnitRevisionStale(unit: ProjectUnitResponse, latestKnown?: number | null): boolean {
    const latest = latestKnown != null ? latestKnown : unit.latest_revision;
    return latest != null && unit.revision < latest;
}
