export const COOKIE_CATEGORIES = ["necessary", "analytics", "marketing"] as const;

export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];

export type CookieConsentPreferences = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
};

export type CookieConsentDecisionSource = "accept-all" | "reject-all" | "custom" | "load";

export type CookieConsentChangeMeta = {
    previous: CookieConsentPreferences | null;
    source: CookieConsentDecisionSource;
};

export type CookieConsentChangeListener = (
    preferences: CookieConsentPreferences,
    meta: CookieConsentChangeMeta,
) => void;

export type CookieCategoryDefinition = {
    id: CookieCategory;
    title: string;
    description: string;
    required: boolean;
};
