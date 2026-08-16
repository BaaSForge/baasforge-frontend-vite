import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import { BrowserRouter } from "react-router";

import { DeferredCookieConsent } from "./deferred-cookie-consent";
import { mountPublicApp } from "./mount-public-app";

export function mountHomeClient(root: HTMLElement): void {
    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <BrowserRouter>
                <HomePage />
                <DeferredCookieConsent />
            </BrowserRouter>
        </ThemeProvider>,
    );
}
