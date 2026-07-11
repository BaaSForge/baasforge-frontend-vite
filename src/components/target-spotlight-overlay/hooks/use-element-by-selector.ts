import { useSyncExternalStore } from "react";

export function useElementBySelector(selector: string, enabled: boolean): HTMLElement | null {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!enabled) return () => {};

            if (document.querySelector(selector) != null) return () => {};

            const observer = new MutationObserver(onStoreChange);
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        },
        () => (enabled ? (document.querySelector(selector) as HTMLElement | null) : null),
        () => null,
    );
}
