import "@/styles/global.css";

import { loadPublicFonts } from "@/entries/load-public-fonts";

const appRoot = document.getElementById("root");

if (appRoot == null) {
    throw new Error("Application root was not found");
}

async function startClient(root: HTMLElement) {
    const pathname = window.location.pathname;

    if (pathname === "/") {
        loadPublicFonts(true);
        const { mountHomeClient } = await import("@/entries/home-client");
        mountHomeClient(root);
        return;
    }

    if (pathname === "/pricing") {
        loadPublicFonts();
        const { mountPricingClient } = await import("@/entries/pricing-client");
        mountPricingClient(root);
        return;
    }

    if (pathname === "/privacy-policy" || pathname === "/terms-of-use") {
        loadPublicFonts();
        const { mountLegalClient } = await import("@/entries/legal-client");
        mountLegalClient(root, pathname);
        return;
    }

    if (root.dataset.prerenderedPage === "not-found") {
        loadPublicFonts();
        const { mountNotFoundClient } = await import("@/entries/not-found-client");
        mountNotFoundClient(root);
        return;
    }

    const { mountDashboardClient } = await import("@/entries/dashboard-client");
    mountDashboardClient(root);
}

void startClient(appRoot);
