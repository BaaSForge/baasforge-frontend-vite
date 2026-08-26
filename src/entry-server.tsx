import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import CareersPage from "@/pages/careers/page";
import NotFoundPage from "@/pages/errors/not-found/page";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy/page";
import TermsOfUsePage from "@/pages/legal/terms-of-use/page";
import PricingPage from "@/pages/pricing/page";
import { QueryProvider } from "@/components/query-provider";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";

export function renderHomePage() {
    const html = renderToString(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <MemoryRouter initialEntries={["/"]}>
                <HomePage />
            </MemoryRouter>
        </ThemeProvider>,
    );

    return html;
}

export function renderCareersPage() {
    return renderToString(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <MemoryRouter initialEntries={["/careers"]}>
                <CareersPage />
            </MemoryRouter>
        </ThemeProvider>,
    );
}

export function renderLegalPage(pathname: string) {
    const page = pathname === "/privacy-policy" ? <PrivacyPolicyPage /> : <TermsOfUsePage />;

    return renderToString(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <MemoryRouter initialEntries={[pathname]}>{page}</MemoryRouter>
        </ThemeProvider>,
    );
}

export function renderPricingPage() {
    return renderToString(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <QueryProvider>
                <MemoryRouter initialEntries={["/pricing"]}>
                    <PricingPage />
                </MemoryRouter>
            </QueryProvider>
        </ThemeProvider>,
    );
}

export function renderNotFoundPage(pathname: string) {
    return renderToString(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <MemoryRouter initialEntries={[pathname]}>
                <NotFoundPage />
            </MemoryRouter>
        </ThemeProvider>,
    );
}
