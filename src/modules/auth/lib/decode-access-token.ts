import type { Token } from "../types";

export type DecodedAccessTokenPayload = {
    is_signup_token?: boolean;
    token?: Pick<Token, "is_signup_token">;
};

function decodeBase64UrlJson(segment: string): unknown | null {
    try {
        const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const json = globalThis.atob(padded);
        return JSON.parse(json) as unknown;
    } catch {
        return null;
    }
}

export function decodeAccessTokenPayload(jwt: string): DecodedAccessTokenPayload | null {
    const trimmed = jwt.trim();
    if (trimmed.length === 0) return null;
    const parts = trimmed.split(".");
    if (parts.length < 2) return null;
    const parsed = decodeBase64UrlJson(parts[1]!);
    if (parsed == null || typeof parsed !== "object") return null;
    return parsed as DecodedAccessTokenPayload;
}

export function isSignupAccessToken(jwt: string): boolean {
    const payload = decodeAccessTokenPayload(jwt);
    if (payload == null) return false;
    if (payload.is_signup_token === true) return true;
    return payload.token?.is_signup_token === true;
}

export function isSignupToken(token: Pick<Token, "is_signup_token"> | null | undefined): boolean {
    return token?.is_signup_token === true;
}
