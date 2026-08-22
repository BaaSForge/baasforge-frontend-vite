import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import PricingPage from "@/pages/pricing/page";
import { BrowserRouter } from "react-router";

import { DeferredCookieConsent } from "./deferred-cookie-consent";
import { mountPublicApp } from "./mount-public-app";

export function mountPricingClient(root: HTMLElement): void {
    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <QueryProvider>
                <BrowserRouter>
                    <PricingPage />
                    <DeferredCookieConsent />
                </BrowserRouter>
            </QueryProvider>
        </ThemeProvider>,
    );
}
