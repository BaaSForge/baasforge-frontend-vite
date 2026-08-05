import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import NotFoundPage from "@/pages/errors/not-found/page";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy/page";
import TermsOfUsePage from "@/pages/legal/terms-of-use/page";
import PricingPage from "@/pages/pricing/page";
import { PublicQueryProvider } from "@/components/public-query-provider";
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
            <PublicQueryProvider>
                <MemoryRouter initialEntries={["/pricing"]}>
                    <PricingPage />
                </MemoryRouter>
            </PublicQueryProvider>
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
