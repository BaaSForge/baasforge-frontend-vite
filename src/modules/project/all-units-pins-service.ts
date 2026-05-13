/**
 * All-units tab pins: project id + runtime id + stable unit path (revision-independent). Values store path metadata only.
 * TODO: Remove stale rows when `lastAccessedAt` is older than ~30 days without being read (with `client-idb-kv` eviction).
 */
import { clientIdbDelete, clientIdbGet, clientIdbListKeysByPrefix, clientIdbSet } from "@/lib/client-idb-kv";
import type { ProjectUnitResponse } from "./types";
import { projectUnitStablePath } from "./project-unit-stable-path";

export type AllUnitsPinPersisted = {
    path: string;
    pinnedAt: number;
    lastAccessedAt: number;
};

const PREFIX_V2 = "all-units-pins:v2:";

function scopePrefix(projectId: string, runtimeKey: string): string {
    return `${PREFIX_V2}${encodeURIComponent(projectId)}:${runtimeKey}:`;
}

function key(projectId: string, runtimeKey: string, path: string): string {
    return `${scopePrefix(projectId, runtimeKey)}${encodeURIComponent(path)}`;
}

function normalizePinRow(raw: unknown): AllUnitsPinPersisted | null {
    if (raw == null || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (typeof o.path !== "string" || typeof o.pinnedAt !== "number") return null;
    return {
        path: o.path,
        pinnedAt: o.pinnedAt,
        lastAccessedAt: typeof o.lastAccessedAt === "number" ? o.lastAccessedAt : o.pinnedAt,
    };
}

const listeners = new Set<() => void>();

function emit(): void {
    for (const l of listeners) l();
}

export function subscribeAllUnitsPins(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export async function listAllUnitsPins(projectId: string, runtimeKey: string): Promise<AllUnitsPinPersisted[]> {
    const prefix = scopePrefix(projectId, runtimeKey);
    const keys = await clientIdbListKeysByPrefix(prefix);
    const out: AllUnitsPinPersisted[] = [];
    for (const k of keys) {
        const raw = await clientIdbGet<unknown>(k);
        const row = normalizePinRow(raw);
        if (row != null) out.push(row);
    }
    out.sort((a, b) => b.pinnedAt - a.pinnedAt);
    return out;
}

export async function addAllUnitsPin(projectId: string, runtimeKey: string, unit: ProjectUnitResponse): Promise<void> {
    const now = Date.now();
    const path = projectUnitStablePath(unit);
    const rec: AllUnitsPinPersisted = {
        path,
        pinnedAt: now,
        lastAccessedAt: now,
    };
    await clientIdbSet(key(projectId, runtimeKey, path), rec);
    emit();
}

export async function removeAllUnitsPin(projectId: string, runtimeKey: string, path: string): Promise<void> {
    await clientIdbDelete(key(projectId, runtimeKey, path));
    emit();
}

export async function clearAllUnitsPins(projectId: string, runtimeKey: string): Promise<void> {
    const prefix = scopePrefix(projectId, runtimeKey);
    const keys = await clientIdbListKeysByPrefix(prefix);
    await Promise.all(keys.map((k) => clientIdbDelete(k)));
    emit();
}
