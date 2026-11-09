import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import TemplatesPage from "@/pages/templates/page";
import { BrowserRouter } from "react-router";

import { DeferredCookieConsent } from "./deferred-cookie-consent";
import { mountPublicApp } from "./mount-public-app";

export function mountTemplatesClient(root: HTMLElement): void {
    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <QueryProvider>
                <BrowserRouter>
                    <TemplatesPage />
                    <DeferredCookieConsent />
                </BrowserRouter>
            </QueryProvider>
        </ThemeProvider>,
    );
}
