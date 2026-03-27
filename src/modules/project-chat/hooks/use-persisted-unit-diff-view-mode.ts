import { useCallback, useState } from "react";

export const UNIT_DIFF_VIEW_MODE_STORAGE_KEY = "baal-chat-session-unit-diff-view-mode";

export type UnitDiffViewMode = "split" | "inline";

function readStoredDiffMode(): UnitDiffViewMode | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(UNIT_DIFF_VIEW_MODE_STORAGE_KEY);
        if (raw === "split" || raw === "inline") return raw;
    } catch {
        /* ignore */
    }
    return null;
}

/** Persists split vs inline layout for the unit JSON diff viewer (desktop). */
export function usePersistedUnitDiffViewMode(): [UnitDiffViewMode, (mode: UnitDiffViewMode) => void] {
    const [mode, setModeState] = useState<UnitDiffViewMode>(() => readStoredDiffMode() ?? "split");

    const setMode = useCallback((next: UnitDiffViewMode) => {
        setModeState(next);
        try {
            window.localStorage.setItem(UNIT_DIFF_VIEW_MODE_STORAGE_KEY, next);
        } catch {
            /* ignore */
        }
    }, []);

    return [mode, setMode];
}
