import { lazy, Suspense } from "react";
import { Outlet } from "react-router";

import { AppStateLogger } from "@/modules/app-state";

import { Loadable } from "./loadable";

const CookieConsentHost = lazy(() =>
    import("@/components/cookie-consent").then((m) => ({ default: m.CookieConsentHost })),
);

export const RootLayout = () => {
    return (
        <Loadable>
            <AppStateLogger />
            <Outlet />
            <Suspense fallback={null}>
                <CookieConsentHost />
            </Suspense>
        </Loadable>
    );
};
