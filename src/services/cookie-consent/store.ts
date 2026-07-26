import { createStore } from "zustand";

import { readPersistedConsent, writePersistedConsent } from "./storage";
import type {
    CookieCategory,
    CookieConsentChangeListener,
    CookieConsentDecisionSource,
    CookieConsentPreferences,
} from "./types";

export type CookieConsentUiState = {
    settingsOpen: boolean;
};

export type CookieConsentState = {
    preferences: CookieConsentPreferences | null;
    settingsOpen: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    setPreferences: (next: Pick<CookieConsentPreferences, "analytics" | "marketing">) => void;
    openSettings: () => void;
    closeSettings: () => void;
    setSettingsOpen: (open: boolean) => void;
    isAllowed: (category: CookieCategory) => boolean;
    hasResponded: () => boolean;
};

const ALL_ALLOWED: CookieConsentPreferences = {
    necessary: true,
    analytics: true,
    marketing: true,
};

const ESSENTIAL_ONLY: CookieConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
};

const changeListeners = new Set<CookieConsentChangeListener>();

function notifyChange(
    preferences: CookieConsentPreferences,
    previous: CookieConsentPreferences | null,
    source: CookieConsentDecisionSource,
) {
    for (const listener of changeListeners) {
        listener(preferences, { previous, source });
    }
}

function persistAndSet(
    set: (partial: Partial<CookieConsentState>) => void,
    get: () => CookieConsentState,
    preferences: CookieConsentPreferences,
    source: Exclude<CookieConsentDecisionSource, "load">,
) {
    const previous = get().preferences;
    writePersistedConsent(preferences);
    set({ preferences, settingsOpen: false });
    notifyChange(preferences, previous, source);
}

export const cookieConsentStore = createStore<CookieConsentState>((set, get) => ({
    preferences: readPersistedConsent(),
    settingsOpen: false,
    acceptAll() {
        persistAndSet(set, get, ALL_ALLOWED, "accept-all");
    },
    rejectAll() {
        persistAndSet(set, get, ESSENTIAL_ONLY, "reject-all");
    },
    setPreferences(next) {
        persistAndSet(
            set,
            get,
            { necessary: true, analytics: next.analytics, marketing: next.marketing },
            "custom",
        );
    },
    openSettings() {
        set({ settingsOpen: true });
    },
    closeSettings() {
        set({ settingsOpen: false });
    },
    setSettingsOpen(open) {
        set({ settingsOpen: open });
    },
    isAllowed(category) {
        if (category === "necessary") return true;
        const prefs = get().preferences;
        if (prefs == null) return false;
        return prefs[category];
    },
    hasResponded() {
        return get().preferences != null;
    },
}));

export function subscribeCookieConsent(
    listener: CookieConsentChangeListener,
    options?: { fireImmediately?: boolean },
): () => void {
    changeListeners.add(listener);
    if (options?.fireImmediately) {
        const preferences = cookieConsentStore.getState().preferences;
        if (preferences != null) {
            listener(preferences, { previous: null, source: "load" });
        }
    }
    return () => {
        changeListeners.delete(listener);
    };
}
