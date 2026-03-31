import type { ProjectUnitResponse } from "./types";

/**
 * Only meaningful inside a chat: compares the unit to session-scoped latest (cache and/or API).
 * @param latestKnown — when set (e.g. from `chatSessionUnitLatestRevisionsByUnitId`), used instead of `unit.latest_revision` when the unit belongs to this session.
 */
export function isUnitRevisionStale(
    unit: ProjectUnitResponse,
    latestKnown: number | null | undefined,
    chatSessionId: string,
): boolean {
    if (unit.chat_session_id != null && unit.chat_session_id !== chatSessionId) {
        const latest = unit.latest_revision;
        return latest != null && unit.revision < latest;
    }
    const latest = latestKnown != null ? latestKnown : unit.latest_revision;
    return latest != null && unit.revision < latest;
}
