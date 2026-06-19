import { useSyncExternalStore } from "react";

export function useElementById(elementId: string, enabled: boolean): HTMLElement | null {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!enabled) return () => {};

            if (document.getElementById(elementId) != null) return () => {};

            const observer = new MutationObserver(onStoreChange);
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        },
        () => (enabled ? document.getElementById(elementId) : null),
        () => null,
    );
}
