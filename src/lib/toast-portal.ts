export const TOAST_PORTAL_ID = "tldx-toast-container";

export function ensureToastPortalContainer(): HTMLDivElement {
    const existing = document.getElementById(TOAST_PORTAL_ID);
    let container: HTMLDivElement;
    if (existing instanceof HTMLDivElement) {
        container = existing;
    } else {
        container = document.createElement("div");
        container.id = TOAST_PORTAL_ID;
        container.dataset.slot = "toast-portal";
        container.className = "pointer-events-none fixed inset-0 z-[100]";
    }
    document.body.appendChild(container);
    return container;
}

export function keepToastPortalOnTop(container: HTMLElement): () => void {
    const moveToEnd = () => {
        if (container.parentNode === document.body && container !== document.body.lastElementChild) {
            document.body.appendChild(container);
        }
    };

    moveToEnd();
    const observer = new MutationObserver(moveToEnd);
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
}
