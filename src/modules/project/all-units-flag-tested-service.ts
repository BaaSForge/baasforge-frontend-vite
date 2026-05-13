/**
 * All-units "flag tested": scoped by project id + chat session id + unit id (revision-specific `unit.id`).
 *
 * TODO: Evict rows whose `lastTouchedAt` is older than 30 days (not read or written), so this store does not grow without bound.
 */
import { clientIdbDelete, clientIdbGet, clientIdbSet } from "@/lib/client-idb-kv";
import type { ProjectUnitResponse } from "./types";

export type AllUnitsFlagTestedRow = {
    lastTouchedAt: number;
};

const PREFIX_V1 = "all-units-flag-tested:v1:";

const listeners = new Set<() => void>();

function emit(): void {
    for (const l of listeners) l();
}

export function subscribeAllUnitsFlagTested(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function normalizeChatSessionId(chatSessionId: string | null | undefined): string {
    const t = chatSessionId?.trim() ?? "";
    return t.length > 0 ? t : "__no_session__";
}

function rowKey(projectId: string, chatSessionId: string | null | undefined, unitId: string): string {
    const s = normalizeChatSessionId(chatSessionId);
    return `${PREFIX_V1}${encodeURIComponent(projectId)}:${encodeURIComponent(s)}:${encodeURIComponent(unitId)}`;
}

function normalizeRow(raw: unknown): AllUnitsFlagTestedRow | null {
    if (raw == null || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (typeof o.lastTouchedAt !== "number") return null;
    return { lastTouchedAt: o.lastTouchedAt };
}

export async function getAllUnitsFlagTestedAndTouch(
    projectId: string,
    chatSessionId: string | null | undefined,
    unitId: string,
): Promise<boolean> {
    const k = rowKey(projectId, chatSessionId, unitId);
    const raw = await clientIdbGet<unknown>(k);
    const row = normalizeRow(raw);
    if (row == null) return false;
    await clientIdbSet(k, { lastTouchedAt: Date.now() });
    return true;
}

export async function toggleAllUnitsFlagTested(projectId: string, unit: ProjectUnitResponse): Promise<boolean> {
    const k = rowKey(projectId, unit.chat_session_id, unit.id);
    const raw = await clientIdbGet<unknown>(k);
    if (normalizeRow(raw) != null) {
        await clientIdbDelete(k);
        emit();
        return false;
    }
    await clientIdbSet(k, { lastTouchedAt: Date.now() });
    emit();
    return true;
}
