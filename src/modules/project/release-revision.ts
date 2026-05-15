import type { ProjectRuntimeResponse, ReleaseResponse } from "./types";

const RELEASE_REVISION_RE = /^\d+(\.\d+)?$/;

export function coerceReleaseRevisionString(raw: unknown): string {
    if (typeof raw === "string") return raw.trim();
    if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
    return String(raw ?? "").trim();
}

export function coerceReleaseResponse(r: ReleaseResponse): ReleaseResponse {
    return {
        ...r,
        revision: coerceReleaseRevisionString(r.revision as unknown),
        base_production_release: r.base_production_release != null ? coerceReleaseResponse(r.base_production_release) : null,
    };
}

export function coerceProjectRuntimeResponse(runtime: ProjectRuntimeResponse): ProjectRuntimeResponse {
    const lr = runtime.live_release;
    return {
        ...runtime,
        live_release: lr != null ? coerceReleaseResponse(lr) : null,
    };
}

export function isValidReleaseRevisionString(revision: string): boolean {
    return RELEASE_REVISION_RE.test(revision.trim());
}

export function parseReleaseRevisionParts(revision: string): { major: number; minor: number } | null {
    const t = revision.trim();
    if (!RELEASE_REVISION_RE.test(t)) return null;
    const dot = t.indexOf(".");
    if (dot < 0) {
        const major = Number(t);
        return Number.isFinite(major) ? { major, minor: 0 } : null;
    }
    const major = Number(t.slice(0, dot));
    const minor = Number(t.slice(dot + 1));
    return Number.isFinite(major) && Number.isFinite(minor) ? { major, minor } : null;
}

export function compareReleaseRevisions(a: string, b: string): number {
    const pa = parseReleaseRevisionParts(a);
    const pb = parseReleaseRevisionParts(b);
    if (pa && pb) {
        if (pa.major !== pb.major) return pa.major - pb.major;
        return pa.minor - pb.minor;
    }
    if (pa && !pb) return 1;
    if (!pa && pb) return -1;
    return a.trim().localeCompare(b.trim());
}
