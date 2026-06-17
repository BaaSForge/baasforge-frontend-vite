export type DismissFlagStorage = {
    isDismissed: () => boolean;
    markDismissed: () => void;
};

export function createDismissFlagStorage(storageKey: string): DismissFlagStorage {
    function isDismissed(): boolean {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
            return false;
        }
        return globalThis.localStorage.getItem(storageKey) === "1";
    }

    function markDismissed(): void {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
            return;
        }
        try {
            globalThis.localStorage.setItem(storageKey, "1");
        } catch {
            /* ignore */
        }
    }

    return { isDismissed, markDismissed };
}
