import { PublicCookieConsentHost } from "@/components/cookie-consent/public-cookie-consent";
import { useSyncExternalStore } from "react";

export function DeferredCookieConsent() {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    return mounted ? <PublicCookieConsentHost /> : null;
}
