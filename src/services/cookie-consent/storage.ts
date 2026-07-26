import type { CookieConsentPreferences } from "./types";

export const COOKIE_CONSENT_STORAGE_KEY = "baasforge:cookie-consent:v1";

type PersistedCookieConsentV1 = {
    v: 1;
    updatedAt: number;
    analytics: boolean;
    marketing: boolean;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function resolveStorage(explicit?: StorageLike | null): StorageLike | null {
    if (explicit != null) return explicit;
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage != null) {
        return globalThis.localStorage;
    }
    return null;
}

export function readPersistedConsent(storage?: StorageLike | null): CookieConsentPreferences | null {
    const store = resolveStorage(storage);
    if (store == null) return null;
    try {
        const raw = store.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (raw == null) return null;
        const parsed = JSON.parse(raw) as unknown;
        if (
            parsed == null ||
            typeof parsed !== "object" ||
            (parsed as PersistedCookieConsentV1).v !== 1 ||
            typeof (parsed as PersistedCookieConsentV1).analytics !== "boolean" ||
            typeof (parsed as PersistedCookieConsentV1).marketing !== "boolean"
        ) {
            return null;
        }
        return {
            necessary: true,
            analytics: (parsed as PersistedCookieConsentV1).analytics,
            marketing: (parsed as PersistedCookieConsentV1).marketing,
        };
    } catch {
        return null;
    }
}

export function writePersistedConsent(
    preferences: CookieConsentPreferences,
    storage?: StorageLike | null,
): void {
    const store = resolveStorage(storage);
    if (store == null) return;
    const payload: PersistedCookieConsentV1 = {
        v: 1,
        updatedAt: Date.now(),
        analytics: preferences.analytics,
        marketing: preferences.marketing,
    };
    try {
        store.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        /* ignore quota / private mode */
    }
}

export function clearPersistedConsent(storage?: StorageLike | null): void {
    const store = resolveStorage(storage);
    if (store == null) return;
    try {
        store.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    } catch {
        /* ignore */
    }
}
