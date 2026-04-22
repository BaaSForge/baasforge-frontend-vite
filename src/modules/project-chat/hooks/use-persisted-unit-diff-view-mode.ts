import { useCallback, useSyncExternalStore } from "react";

export const UNIT_DIFF_VIEW_MODE_STORAGE_KEY = "baal-chat-session-unit-diff-view-mode";

/** Same-window updates don't fire `storage`; we broadcast so all hook subscribers stay in sync. */
const UNIT_DIFF_VIEW_MODE_CHANGED_EVENT = "baal-unit-diff-view-mode-changed";

export type UnitDiffViewMode = "split" | "inline" | "current";

function readStoredDiffMode(): UnitDiffViewMode | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(UNIT_DIFF_VIEW_MODE_STORAGE_KEY);
        if (raw === "split" || raw === "inline" || raw === "current") return raw;
    } catch {
        /* ignore */
    }
    return null;
}

function getSnapshot(): UnitDiffViewMode {
    return readStoredDiffMode() ?? "split";
}

function getServerSnapshot(): UnitDiffViewMode {
    return "split";
}

function subscribe(onStoreChange: () => void) {
    const onStorage = (e: StorageEvent) => {
        if (e.key === UNIT_DIFF_VIEW_MODE_STORAGE_KEY || e.key === null) onStoreChange();
    };
    const onLocal = () => onStoreChange();
    window.addEventListener("storage", onStorage);
    window.addEventListener(UNIT_DIFF_VIEW_MODE_CHANGED_EVENT, onLocal);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(UNIT_DIFF_VIEW_MODE_CHANGED_EVENT, onLocal);
    };
}

/** Persists split / inline / current for the unit code viewer. All callers share one persisted value. */
export function usePersistedUnitDiffViewMode(): [UnitDiffViewMode, (mode: UnitDiffViewMode) => void] {
    const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setMode = useCallback((next: UnitDiffViewMode) => {
        try {
            window.localStorage.setItem(UNIT_DIFF_VIEW_MODE_STORAGE_KEY, next);
        } catch {
            /* ignore */
        }
        window.dispatchEvent(new Event(UNIT_DIFF_VIEW_MODE_CHANGED_EVENT));
    }, []);

    return [mode, setMode];
}
