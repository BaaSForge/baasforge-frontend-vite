import type { ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

export function mountPublicApp(root: HTMLElement, app: ReactNode): void {
    if (root.hasChildNodes()) {
        hydrateRoot(root, app);
        return;
    }

    createRoot(root).render(app);
}
