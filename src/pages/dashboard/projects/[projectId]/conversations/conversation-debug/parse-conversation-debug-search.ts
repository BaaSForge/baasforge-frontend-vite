import { PlatformEnvironmentType } from "@/modules/project/types";

export type ConversationDebugFromUrl = {
    release_id: string;
    environment: PlatformEnvironmentType;
    /** Human-readable revision when present in the `debug` JSON (e.g. Start Debug flow). */
    release_revision?: string;
    /** Trace ids from Start Debug by trace id (`traceIDs` in URL JSON). */
    trace_ids?: string[];
};

function normalizeEnvironment(raw: unknown): PlatformEnvironmentType | null {
    if (raw === PlatformEnvironmentType.prod || raw === "prod" || raw === "production") {
        return PlatformEnvironmentType.prod;
    }
    if (raw === PlatformEnvironmentType.stage || raw === "stage") {
        return PlatformEnvironmentType.stage;
    }
    return null;
}

function parseTraceIdsFromDebugObject(o: Record<string, unknown>): string[] | undefined {
    const raw = o.traceIDs ?? o.trace_ids;
    if (typeof raw !== "string") return undefined;
    const parts = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    return parts.length > 0 ? parts : undefined;
}

function parseDebugJsonObject(o: Record<string, unknown>): ConversationDebugFromUrl | null {
    const release_id = typeof o.release_id === "string" ? o.release_id.trim() : "";
    if (!release_id) return null;
    const environment = normalizeEnvironment(o.environment);
    if (!environment) return null;

    let release_revision: string | undefined;
    const rr = o.release_revision;
    if (typeof rr === "string" && rr.trim() !== "") {
        release_revision = rr.trim();
    } else if (typeof rr === "number" && Number.isFinite(rr)) {
        release_revision = String(rr);
    }

    const trace_ids = parseTraceIdsFromDebugObject(o);

    return { release_id, environment, release_revision, trace_ids };
}

function tryParseDebugPayloadJson(jsonStr: string): ConversationDebugFromUrl | null {
    const trimmed = jsonStr.trim();
    if (!trimmed) return null;
    try {
        const o = JSON.parse(trimmed) as unknown;
        if (o != null && typeof o === "object" && !Array.isArray(o)) {
            return parseDebugJsonObject(o as Record<string, unknown>);
        }
    } catch {
        try {
            const decoded = decodeURIComponent(trimmed);
            const o = JSON.parse(decoded) as unknown;
            if (o != null && typeof o === "object" && !Array.isArray(o)) {
                return parseDebugJsonObject(o as Record<string, unknown>);
            }
        } catch {
            return null;
        }
    }
    return null;
}

/** Extract raw `debug` query value from a search string (handles partially encoded `?debug=…` blobs). */
export function extractRawDebugQueryValue(search: string): string | null {
    const withoutQ = search.startsWith("?") ? search.slice(1) : search;
    if (!withoutQ) return null;

    const params = new URLSearchParams(withoutQ);
    const direct = params.get("debug");
    if (direct != null && direct !== "") return direct;

    let decoded: string;
    try {
        decoded = decodeURIComponent(withoutQ);
    } catch {
        return null;
    }

    if (!decoded.includes("debug=")) return null;
    const inner = decoded.startsWith("?") ? decoded.slice(1) : decoded;

    /** `debug` may appear after other params (`foo=1&debug=…`), not only at the start of the string. */
    const match = /(?:^|[?&])debug=([^&]*)/.exec(inner);
    const fromRegex = match?.[1]?.trim();
    if (fromRegex) {
        try {
            return decodeURIComponent(fromRegex);
        } catch {
            return fromRegex;
        }
    }

    const innerParams = new URLSearchParams(inner);
    const nested = innerParams.get("debug");
    if (nested != null && nested !== "") return nested;

    return null;
}

export function parseConversationDebugFromSearch(search: string): ConversationDebugFromUrl | null {
    const raw = extractRawDebugQueryValue(search);
    if (raw == null) return null;
    return tryParseDebugPayloadJson(raw);
}
