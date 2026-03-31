import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { ContextModulePair, ProjectUnitType } from "@/modules/project/types";
import { STATIC_PROJECT_UNIT_TYPES } from "@/modules/project/types";

const VALID_UNIT_TYPES = new Set<string>(STATIC_PROJECT_UNIT_TYPES);

export type UnitsTabValue = "new" | "all";

export type AllUnitsGroupMode = "ungrouped" | "grouped";

export const DEFAULT_ALL_UNITS_PAGE = 1;
export const DEFAULT_ALL_UNITS_PAGE_SIZE = 20;

const PAGE_SIZES = [10, 20, 50] as const;

export function isAllowedPageSize(n: number): n is (typeof PAGE_SIZES)[number] {
    return PAGE_SIZES.includes(n as (typeof PAGE_SIZES)[number]);
}

export function parsePositiveInt(raw: string | null, fallback: number): number {
    if (raw == null || raw === "") return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseUnitTypesFromParams(searchParams: URLSearchParams): ProjectUnitType[] {
    const raw = searchParams.getAll("ut");
    const out: ProjectUnitType[] = [];
    const seen = new Set<string>();
    for (const r of raw) {
        if (VALID_UNIT_TYPES.has(r) && !seen.has(r)) {
            seen.add(r);
            out.push(r as ProjectUnitType);
        }
    }
    return out;
}

function parseContextsFromParams(searchParams: URLSearchParams): string[] {
    const raw = searchParams.getAll("ctx");
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of raw) {
        const t = r.trim();
        if (t.length > 0 && !seen.has(t)) {
            seen.add(t);
            out.push(t);
        }
    }
    return out;
}

function parsePairsFromParams(searchParams: URLSearchParams): ContextModulePair[] {
    const raw = searchParams.get("cmp");
    if (raw == null || raw.trim() === "") return [];
    try {
        const decoded = decodeURIComponent(raw);
        const parsed: unknown = JSON.parse(decoded);
        if (!Array.isArray(parsed)) return [];
        const out: ContextModulePair[] = [];
        const seen = new Set<string>();
        for (const item of parsed) {
            if (item == null || typeof item !== "object") continue;
            const cs = (item as { context_slug?: unknown }).context_slug;
            const ms = (item as { module_slug?: unknown }).module_slug;
            if (typeof cs !== "string" || typeof ms !== "string") continue;
            const c = cs.trim();
            const m = ms.trim();
            if (c.length === 0 || m.length === 0) continue;
            const key = `${c}\u0000${m}`;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({ context_slug: c, module_slug: m });
        }
        return out;
    } catch {
        return [];
    }
}

/** URL `group` when set; otherwise the same localStorage key as the New units tab. */
export function getEffectiveGroupMode(searchParams: URLSearchParams): AllUnitsGroupMode {
    const raw = searchParams.get("group");
    if (raw === "grouped" || raw === "ungrouped") return raw;
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE);
        if (stored === "ungrouped" || stored === "grouped") return stored;
    } catch {
        // ignore
    }
    return "ungrouped";
}

export function readReleaseUnitsSearchParams(searchParams: URLSearchParams): {
    unitsTab: UnitsTabValue;
    allUnits: {
        page: number;
        pageSize: number;
        groupMode: AllUnitsGroupMode;
        contexts: string[];
        unitTypes: ProjectUnitType[];
        contextModulePairs: ContextModulePair[];
    };
} {
    const tabRaw = searchParams.get("unitsTab");
    const unitsTab: UnitsTabValue = tabRaw === "all" ? "all" : "new";

    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_ALL_UNITS_PAGE);
    const pageSizeRaw = parsePositiveInt(searchParams.get("pageSize"), DEFAULT_ALL_UNITS_PAGE_SIZE);
    const pageSize = isAllowedPageSize(pageSizeRaw) ? pageSizeRaw : DEFAULT_ALL_UNITS_PAGE_SIZE;

    return {
        unitsTab,
        allUnits: {
            page,
            pageSize,
            groupMode: getEffectiveGroupMode(searchParams),
            contexts: parseContextsFromParams(searchParams),
            unitTypes: parseUnitTypesFromParams(searchParams),
            contextModulePairs: parsePairsFromParams(searchParams),
        },
    };
}

/** Drop module pairs whose context is not in the selected context list. */
export function pairsCompatibleWithContexts(
    contexts: string[],
    pairs: ContextModulePair[],
): ContextModulePair[] {
    const set = new Set(contexts);
    return pairs.filter((p) => set.has(p.context_slug));
}

function setMultiParam(next: URLSearchParams, key: string, values: string[]): void {
    next.delete(key);
    for (const v of values) {
        next.append(key, v);
    }
}

export function writePairsParam(next: URLSearchParams, pairs: ContextModulePair[]): void {
    if (pairs.length === 0) {
        next.delete("cmp");
        return;
    }
    next.set("cmp", encodeURIComponent(JSON.stringify(pairs)));
}

/** Update URL search params for the all-units tab while preserving unrelated keys. */
export function mergeAllUnitsSearchParams(
    prev: URLSearchParams,
    patch: Partial<{
        unitsTab: UnitsTabValue;
        page: number;
        pageSize: number;
        groupMode: AllUnitsGroupMode;
        contexts: string[];
        unitTypes: ProjectUnitType[];
        contextModulePairs: ContextModulePair[];
    }>,
): URLSearchParams {
    const next = new URLSearchParams(prev);

    if (patch.unitsTab != null) {
        if (patch.unitsTab === "new") {
            next.delete("unitsTab");
        } else {
            next.set("unitsTab", "all");
        }
    }

    if (patch.page != null) {
        if (patch.page === DEFAULT_ALL_UNITS_PAGE) next.delete("page");
        else next.set("page", String(patch.page));
    }

    if (patch.pageSize != null) {
        if (patch.pageSize === DEFAULT_ALL_UNITS_PAGE_SIZE) next.delete("pageSize");
        else next.set("pageSize", String(patch.pageSize));
    }

    if (patch.groupMode != null) {
        if (patch.groupMode === "ungrouped") next.delete("group");
        else next.set("group", patch.groupMode);
    }

    if (patch.contexts != null) {
        setMultiParam(next, "ctx", patch.contexts);
    }

    if (patch.unitTypes != null) {
        setMultiParam(next, "ut", patch.unitTypes);
    }

    if (patch.contextModulePairs != null) {
        writePairsParam(next, patch.contextModulePairs);
    }

    return next;
}
