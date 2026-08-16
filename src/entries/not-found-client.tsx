import { ThemeProvider } from "@/components/theme-provider";
import NotFoundPage from "@/pages/errors/not-found/page";
import { BrowserRouter } from "react-router";

import { mountPublicApp } from "./mount-public-app";

export function mountNotFoundClient(root: HTMLElement): void {
    mountPublicApp(
        root,
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        </ThemeProvider>,
    );
}
