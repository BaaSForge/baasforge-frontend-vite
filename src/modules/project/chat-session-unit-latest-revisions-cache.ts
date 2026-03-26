import { QueryKeys } from "@/constants/query-keys";
import type { QueryClient } from "@tanstack/react-query";
import type { ProjectUnitResponse } from "./types";

/** Per chat session: stable logical unit id → latest known revision (see `stableUnitIdForRevisionCache`). */
export type ChatSessionUnitLatestRevisionsByUnitIdMap = Record<string, number>;

/**
 * Collapse composite `unit.id` values to one cache key per logical unit.
 * Examples:
 * - `system…default-bootstrap.1:2` → `system…default-bootstrap` (ignore `:…`; strip trailing `.<revision>`)
 * - `foo@5` → `foo` (legacy `@revision` suffix)
 */
export function stableUnitIdForRevisionCache(unitId: string): string {
    let s = unitId.split(":")[0] ?? unitId;
    s = s.replace(/@\d+$/, "");
    s = s.replace(/\.(\d+)$/, "");
    return s;
}

/**
 * Applies `unit-latest-revisions-by-ids` result: `unitPaths[i]` matches `revisions[i]` (same order as `unit_paths` in the request).
 */
export function mergeChatSessionUnitLatestRevisionsFromRevisionList(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
    unitPaths: string[],
    revisions: (number | null)[],
): void {
    if (unitPaths.length === 0) return;
    const key = QueryKeys.chatSessionUnitLatestRevisionsByUnitId(projectId, chatSessionId);
    const n = Math.min(unitPaths.length, revisions.length);
    queryClient.setQueryData<ChatSessionUnitLatestRevisionsByUnitIdMap>(key, (prev) => {
        const next: ChatSessionUnitLatestRevisionsByUnitIdMap = { ...(prev ?? {}) };
        for (let i = 0; i < n; i++) {
            const rev = revisions[i];
            if (rev == null) continue;
            const idKey = unitPaths[i]!;
            next[idKey] = Math.max(next[idKey] ?? 0, rev);
        }
        return next;
    });
}

/** WS payload for this session: `unit.revision` is the current latest for that unit. */
export function mergeChatSessionUnitLatestRevisionFromWsUnit(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
    unit: ProjectUnitResponse,
): void {
    const key = QueryKeys.chatSessionUnitLatestRevisionsByUnitId(projectId, chatSessionId);
    queryClient.setQueryData<ChatSessionUnitLatestRevisionsByUnitIdMap>(key, (prev) => {
        const next: ChatSessionUnitLatestRevisionsByUnitIdMap = { ...(prev ?? {}) };
        const v = unit.revision;
        const idKey = stableUnitIdForRevisionCache(unit.id);
        next[idKey] = Math.max(next[idKey] ?? 0, v);
        return next;
    });
}
