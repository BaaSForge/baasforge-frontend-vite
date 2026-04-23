import { createSyncedStringLocalStorageStore, useSyncedStringLocalStorageStore } from "@/hooks/synced-local-storage-store";

export const UNIT_DIFF_VIEW_MODE_STORAGE_KEY = "baal-chat-session-unit-diff-view-mode";

const UNIT_DIFF_VIEW_MODE_CHANGED_EVENT = "baal-unit-diff-view-mode-changed";

export type UnitDiffViewMode = "split" | "inline" | "current";

const unitDiffViewModeStore = createSyncedStringLocalStorageStore<UnitDiffViewMode>({
    storageKey: UNIT_DIFF_VIEW_MODE_STORAGE_KEY,
    changedEventName: UNIT_DIFF_VIEW_MODE_CHANGED_EVENT,
    parse: (raw) => (raw === "split" || raw === "inline" || raw === "current" ? raw : null),
    fallback: "split",
    serverSnapshot: "split",
});

export function usePersistedUnitDiffViewMode(): [UnitDiffViewMode, (mode: UnitDiffViewMode) => void] {
    return useSyncedStringLocalStorageStore(unitDiffViewModeStore);
}
