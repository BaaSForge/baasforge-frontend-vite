import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import NotFoundPage from "@/pages/errors/not-found/page";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy/page";
import TermsOfUsePage from "@/pages/legal/terms-of-use/page";
import PricingPage from "@/pages/pricing/page";
import { QueryProvider } from "@/components/query-provider";
import "@/styles/global.css";
import { lazy, Suspense, useSyncExternalStore } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, RouterProvider } from "react-router";
import Providers from "./components/providers.tsx";
import router from "./pages/router.tsx";

const CookieConsentHost = lazy(() =>
    import("@/components/cookie-consent").then((m) => ({ default: m.CookieConsentHost })),
);

function DeferredCookieConsent() {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
    return mounted ? <Suspense fallback={null}><CookieConsentHost /></Suspense> : null;
}

const appRoot = document.getElementById("root")!;
const homeApp = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <BrowserRouter>
            <HomePage />
            <DeferredCookieConsent />
        </BrowserRouter>
    </ThemeProvider>
);
const app = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Providers>
            <RouterProvider router={router} />
        </Providers>
    </ThemeProvider>
);

const pricingApp = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <QueryProvider>
            <BrowserRouter>
                <PricingPage />
                <DeferredCookieConsent />
            </BrowserRouter>
        </QueryProvider>
    </ThemeProvider>
);

const notFoundApp = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <BrowserRouter>
            <NotFoundPage />
        </BrowserRouter>
    </ThemeProvider>
);

function legalApp(page: React.ReactNode) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <BrowserRouter>{page}</BrowserRouter>
        </ThemeProvider>
    );
}

function mountPublicApp(app: React.ReactNode) {
    if (appRoot.hasChildNodes()) hydrateRoot(appRoot, app);
    else createRoot(appRoot).render(app);
}

if (window.location.pathname === "/") {
    mountPublicApp(homeApp);
} else if (window.location.pathname === "/pricing") {
    mountPublicApp(pricingApp);
} else if (window.location.pathname === "/privacy-policy") {
    mountPublicApp(legalApp(<PrivacyPolicyPage />));
} else if (window.location.pathname === "/terms-of-use") {
    mountPublicApp(legalApp(<TermsOfUsePage />));
} else if (appRoot.dataset.prerenderedPage === "not-found") {
    mountPublicApp(notFoundApp);
} else {
    // The static fallback contains homepage markup. Remove it before mounting an
    // application route so login and dashboard transitions never reveal it.
    appRoot.replaceChildren();
    createRoot(appRoot).render(app);
}
