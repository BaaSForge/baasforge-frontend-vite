import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
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
