import { useSyncExternalStore } from "react";

export function useElementById(elementId: string, enabled: boolean): HTMLElement | null {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!enabled) return () => {};

            let trackedElement = document.getElementById(elementId);

            const sync = () => {
                const nextElement = document.getElementById(elementId);
                if (nextElement !== trackedElement) {
                    trackedElement = nextElement;
                    onStoreChange();
                }
            };

            const observer = new MutationObserver(sync);
            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        },
        () => (enabled ? document.getElementById(elementId) : null),
        () => null,
    );
}
