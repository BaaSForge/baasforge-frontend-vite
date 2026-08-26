import { ThemeProvider } from "@/components/theme-provider";
import CareersPage from "@/pages/careers/page";
import { BrowserRouter } from "react-router";

import { DeferredCookieConsent } from "./deferred-cookie-consent";
import { mountPublicApp } from "./mount-public-app";

export function mountCareersClient(root: HTMLElement): void {
    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <BrowserRouter>
                <CareersPage />
                <DeferredCookieConsent />
            </BrowserRouter>
        </ThemeProvider>,
    );
}
