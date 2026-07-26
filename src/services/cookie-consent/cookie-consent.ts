import { cookieConsentStore, subscribeCookieConsent } from "./store";
import type { CookieCategory, CookieConsentPreferences } from "./types";

export function getCookieConsentPreferences(): CookieConsentPreferences | null {
    return cookieConsentStore.getState().preferences;
}

export function hasCookieConsentResponded(): boolean {
    return cookieConsentStore.getState().hasResponded();
}

export function isCookieCategoryAllowed(category: CookieCategory): boolean {
    return cookieConsentStore.getState().isAllowed(category);
}

export function acceptAllCookies(): void {
    cookieConsentStore.getState().acceptAll();
}

export function rejectAllCookies(): void {
    cookieConsentStore.getState().rejectAll();
}

export function setCookieConsentPreferences(
    next: Pick<CookieConsentPreferences, "analytics" | "marketing">,
): void {
    cookieConsentStore.getState().setPreferences(next);
}

export function openCookieSettings(): void {
    cookieConsentStore.getState().openSettings();
}

export function closeCookieSettings(): void {
    cookieConsentStore.getState().closeSettings();
}

export { subscribeCookieConsent };
