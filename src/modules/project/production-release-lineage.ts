import type { ReleaseResponse } from "./types";

function visitReleaseTree(r: ReleaseResponse | null | undefined, into: Map<string, ReleaseResponse>) {
    if (r == null || r.id === "") return;
    if (!into.has(r.id)) into.set(r.id, r);
    visitReleaseTree(r.base_production_release ?? null, into);
}

/** Unique releases from the API list, including nested `base_production_release` chains. */
export function collectReleaseIndex(releases: ReleaseResponse[]): Map<string, ReleaseResponse> {
    const byId = new Map<string, ReleaseResponse>();
    for (const r of releases) visitReleaseTree(r, byId);
    return byId;
}

/**
 * IDs on the live release → parent → … chain via `base_production_release_id`
 * (the production line currently deployed and its ancestors).
 */
export function getLiveProductionLineageIdSet(liveReleaseId: string | null | undefined, byId: Map<string, ReleaseResponse>): Set<string> {
    const lineage = new Set<string>();
    let current: string | null = liveReleaseId ?? null;
    const guard = new Set<string>();
    while (current != null) {
        if (guard.has(current)) break;
        guard.add(current);
        lineage.add(current);
        const row = byId.get(current);
        const parent = row?.base_production_release_id;
        current = parent != null && parent !== "" ? parent : null;
    }
    return lineage;
}

export function listProductionReleasesSortedForSidebar(
    releases: ReleaseResponse[],
    liveReleaseId: string | null | undefined,
): { ordered: ReleaseResponse[]; lineageIds: Set<string> } {
    const byId = collectReleaseIndex(releases);
    const lineageIds = getLiveProductionLineageIdSet(liveReleaseId, byId);
    const ordered = Array.from(byId.values()).sort((a, b) => {
        if (a.revision !== b.revision) return b.revision - a.revision;
        const byTime = b.created_at.localeCompare(a.created_at);
        if (byTime !== 0) return byTime;
        return b.id.localeCompare(a.id);
    });
    return { ordered, lineageIds };
}
