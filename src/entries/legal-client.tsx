import { ThemeProvider } from "@/components/theme-provider";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy/page";
import TermsOfUsePage from "@/pages/legal/terms-of-use/page";
import { BrowserRouter } from "react-router";

import { mountPublicApp } from "./mount-public-app";

export function mountLegalClient(root: HTMLElement, pathname: string): void {
    const page = pathname === "/privacy-policy" ? <PrivacyPolicyPage /> : <TermsOfUsePage />;

    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <BrowserRouter>{page}</BrowserRouter>
        </ThemeProvider>,
    );
}
