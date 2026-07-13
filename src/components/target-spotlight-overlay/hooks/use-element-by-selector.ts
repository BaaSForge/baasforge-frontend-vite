import { useSyncExternalStore } from "react";

export function useElementBySelector(selector: string, enabled: boolean): HTMLElement | null {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!enabled) return () => {};

            let trackedElement = document.querySelector(selector) as HTMLElement | null;

            const sync = () => {
                const nextElement = document.querySelector(selector) as HTMLElement | null;
                if (nextElement !== trackedElement) {
                    trackedElement = nextElement;
                    onStoreChange();
                }
            };

            const observer = new MutationObserver(sync);
            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        },
        () => (enabled ? (document.querySelector(selector) as HTMLElement | null) : null),
        () => null,
    );
}
