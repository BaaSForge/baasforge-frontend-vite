import { useEffect, type RefObject } from "react";

const HOST_SELECTOR = "[data-unit-card-stack]";
const HOST_ATTR = "data-scalar-client-modal-open";

function isScalarClientShellVisible(overlay: HTMLElement) {
    return getComputedStyle(overlay).display !== "none";
}

export function useScalarClientModalHostStack(embedRootRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = embedRootRef.current;
        if (root == null) return;

        const sync = () => {
            const host = root.closest(HOST_SELECTOR);
            if (host == null) return;
            const overlay = root.querySelector<HTMLElement>(".scalar.scalar-app.z-overlay");
            const open = overlay != null && isScalarClientShellVisible(overlay);
            if (open) host.setAttribute(HOST_ATTR, "");
            else host.removeAttribute(HOST_ATTR);
        };

        const mo = new MutationObserver(sync);
        mo.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["style", "class"],
        });
        sync();

        return () => {
            mo.disconnect();
            const host = root.closest(HOST_SELECTOR);
            host?.removeAttribute(HOST_ATTR);
        };
    }, [embedRootRef]);
}
