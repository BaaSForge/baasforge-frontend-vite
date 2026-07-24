import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy/page";
import TermsOfUsePage from "@/pages/legal/terms-of-use/page";
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
