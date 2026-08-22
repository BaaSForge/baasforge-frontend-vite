import Providers from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import router from "@/pages/router";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

export function mountDashboardClient(root: HTMLElement): void {
    // Dashboard routes may receive the prerendered homepage fallback from nginx.
    root.replaceChildren();
    createRoot(root).render(
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <Providers>
                <RouterProvider router={router} />
            </Providers>
        </ThemeProvider>,
    );
}
