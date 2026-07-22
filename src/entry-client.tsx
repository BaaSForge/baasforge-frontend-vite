import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home/page";
import "@/styles/global.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, RouterProvider } from "react-router";
import Providers from "./components/providers.tsx";
import router from "./pages/router.tsx";

const appRoot = document.getElementById("root")!;
const homeApp = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    </ThemeProvider>
);
const app = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Providers>
            <RouterProvider router={router} />
        </Providers>
    </ThemeProvider>
);

if (window.location.pathname === "/") {
    hydrateRoot(appRoot, homeApp);
} else {
    createRoot(appRoot).render(app);
}
