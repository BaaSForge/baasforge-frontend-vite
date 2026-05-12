/** Wire-format tokens embedded in plain-text composer payload (survives API round-trip). */

export const BAAL_INLINE_TOKEN_RE =
    /<baal:inline\s+type="(release|unit|trace)"\s+data="([A-Za-z0-9_-]*)"\s*\/>/g;

const BAAL_INLINE_RELEASE_ONLY_RE = /<baal:inline\s+type="release"\s+data="[A-Za-z0-9_-]*"\s*\/>/g;

const BAAL_INLINE_TRACE_ONLY_RE = /<baal:inline\s+type="trace"\s+data="[A-Za-z0-9_-]*"\s*\/>/g;

/** Removes inline release chips from serialized composer text (unit/trace unchanged). */
export function stripInlineReleaseTokens(serialized: string): string {
    return serialized.replace(BAAL_INLINE_RELEASE_ONLY_RE, "").replace(/\n{3,}/g, "\n\n");
}

/** Removes inline trace chips from serialized composer text (release/unit unchanged). */
export function stripInlineTraceTokens(serialized: string): string {
    return serialized.replace(BAAL_INLINE_TRACE_ONLY_RE, "").replace(/\n{3,}/g, "\n\n");
}

export function utf8ToBase64Url(json: string): string {
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
    const b64 = btoa(bin);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToUtf8(b64url: string): string {
    const padded = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const paddedWithPad = padded + "=".repeat(padLen);
    const bin = atob(paddedWithPad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

export function buildInlineToken(type: "release" | "unit" | "trace", jsonPayload: string): string {
    const data = utf8ToBase64Url(jsonPayload);
    return `<baal:inline type="${type}" data="${data}"/>`;
}
