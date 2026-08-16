import { lazy, Suspense, useSyncExternalStore } from "react";

const CookieConsentHost = lazy(() =>
    import("@/components/cookie-consent").then((module) => ({ default: module.CookieConsentHost })),
);

export function DeferredCookieConsent() {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    return mounted ? (
        <Suspense fallback={null}>
            <CookieConsentHost />
        </Suspense>
    ) : null;
}
