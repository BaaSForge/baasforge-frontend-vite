import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/global.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Providers from "./components/providers.tsx";
import router from "./pages/router.tsx";

const app = (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Providers>
            <RouterProvider router={router} />
        </Providers>
    </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(app);
