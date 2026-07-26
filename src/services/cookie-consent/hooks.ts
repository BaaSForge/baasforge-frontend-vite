import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { cookieConsentStore } from "./store";
import type { CookieCategory, CookieConsentPreferences } from "./types";

export function useCookieConsentPreferences(): CookieConsentPreferences | null {
    return useStore(cookieConsentStore, (s) => s.preferences);
}

export function useHasCookieConsentResponded(): boolean {
    return useStore(cookieConsentStore, (s) => s.preferences != null);
}

export function useIsCookieCategoryAllowed(category: CookieCategory): boolean {
    return useStore(cookieConsentStore, (s) => s.isAllowed(category));
}

export function useCookieConsentSettingsOpen(): boolean {
    return useStore(cookieConsentStore, (s) => s.settingsOpen);
}

export function useCookieConsentActions() {
    return useStore(
        cookieConsentStore,
        useShallow((s) => ({
            acceptAll: s.acceptAll,
            rejectAll: s.rejectAll,
            setPreferences: s.setPreferences,
            openSettings: s.openSettings,
            closeSettings: s.closeSettings,
            setSettingsOpen: s.setSettingsOpen,
        })),
    );
}
