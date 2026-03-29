import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Providers from "./components/providers.tsx";
import router from "./pages/router.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <Providers>
                <RouterProvider router={router} />
            </Providers>
        </ThemeProvider>
    </StrictMode>,
);
