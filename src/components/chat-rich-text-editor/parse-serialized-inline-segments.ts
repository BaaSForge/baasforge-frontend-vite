import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import { coerceReleaseResponse } from "@/modules/project/release-revision";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";

import { BAAL_INLINE_TOKEN_RE, base64UrlToUtf8 } from "./composer-inline-format";
import { releaseComposerEnvironmentLabel } from "./composer-release-display";

export type SerializedTextSegment =
    | { type: "text"; text: string }
    | { type: "release"; release: ReleaseResponse }
    | { type: "unit"; unit: ProjectUnitResponse }
    | { type: "trace"; trace: ChatComposerTraceReference }
    | { type: "raw_token"; token: string };

/** Splits composer wire text into plain runs and decoded inline release/unit/trace payloads. */
export function parseSerializedTextIntoSegments(serialized: string): SerializedTextSegment[] {
    const re = new RegExp(BAAL_INLINE_TOKEN_RE.source, "g");
    const segments: SerializedTextSegment[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(serialized)) !== null) {
        if (m.index > lastIndex) {
            segments.push({ type: "text", text: serialized.slice(lastIndex, m.index) });
        }
        const kind = m[1] as "release" | "unit" | "trace";
        const rawData = m[2];
        try {
            const json = base64UrlToUtf8(rawData);
            const payload: unknown = JSON.parse(json);
            if (kind === "release") {
                segments.push({ type: "release", release: coerceReleaseResponse(payload as ReleaseResponse) });
            } else if (kind === "unit") {
                segments.push({ type: "unit", unit: payload as ProjectUnitResponse });
            } else {
                const trace = payload as ChatComposerTraceReference;
                segments.push({ type: "trace", trace: { ...trace, release: coerceReleaseResponse(trace.release) } });
            }
        } catch {
            segments.push({ type: "raw_token", token: m[0] });
        }
        lastIndex = re.lastIndex;
    }
    if (lastIndex < serialized.length) {
        segments.push({ type: "text", text: serialized.slice(lastIndex) });
    }
    if (segments.length === 0) {
        segments.push({ type: "text", text: serialized });
    }
    return segments;
}

/** One-line preview for sticky headers / titles (no widgets). */
export function serializedTextToStickyPreview(serialized: string): string {
    const parts: string[] = [];
    for (const seg of parseSerializedTextIntoSegments(serialized)) {
        if (seg.type === "text") {
            const t = seg.text.replace(/\s+/g, " ").trim();
            if (t) parts.push(t);
        } else if (seg.type === "release") {
            parts.push(`@release: ${releaseComposerEnvironmentLabel(seg.release)} ${String(seg.release.revision)}`);
        } else if (seg.type === "unit") {
            const u = seg.unit;
            parts.push(`@unit: ${u.context_slug}.${u.module_slug}.${u.unit_type}.${u.revision}`);
        } else if (seg.type === "trace") {
            const tr = seg.trace;
            parts.push(
                `@trace: ${releaseComposerEnvironmentLabel(tr.release)} ${String(tr.release.revision)} #${tr.traceID.trim()}`,
            );
        } else {
            const t = seg.token.replace(/\s+/g, " ").trim();
            if (t) parts.push(t);
        }
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
}
