import { createSyncedJsonLocalStorageStore, useSyncedJsonLocalStorageStore } from "@/hooks/synced-local-storage-store";
import { useCallback } from "react";

export const UNIT_DETAIL_PANELS_STORAGE_KEY = "baal-unit-detail-panels";

const UNIT_DETAIL_PANELS_CHANGED_EVENT = "baal-unit-detail-panels-changed";

export type UnitDetailPanelKey = "code" | "dependencies" | "explanationNote";

export type UnitDetailPanelsState = Record<UnitDetailPanelKey, boolean>;

const DEFAULTS: UnitDetailPanelsState = {
    explanationNote: true,
    code: false,
    dependencies: false,
};

function readStored(): UnitDetailPanelsState {
    if (typeof window === "undefined") return DEFAULTS;
    try {
        const raw = window.localStorage.getItem(UNIT_DETAIL_PANELS_STORAGE_KEY);
        if (raw == null || raw === "") return DEFAULTS;
        const v = JSON.parse(raw) as unknown;
        if (typeof v !== "object" || v === null || Array.isArray(v)) return DEFAULTS;
        const partial = v as Partial<UnitDetailPanelsState>;
        return {
            explanationNote:
                typeof partial.explanationNote === "boolean" ? partial.explanationNote : DEFAULTS.explanationNote,
            code: typeof partial.code === "boolean" ? partial.code : DEFAULTS.code,
            dependencies:
                typeof partial.dependencies === "boolean" ? partial.dependencies : DEFAULTS.dependencies,
        };
    } catch {
        return DEFAULTS;
    }
}

const unitDetailPanelsStore = createSyncedJsonLocalStorageStore<UnitDetailPanelsState>({
    storageKey: UNIT_DETAIL_PANELS_STORAGE_KEY,
    changedEventName: UNIT_DETAIL_PANELS_CHANGED_EVENT,
    getServerSnapshot: () => DEFAULTS,
    read: readStored,
    equal: (a, b) =>
        a.code === b.code && a.explanationNote === b.explanationNote && a.dependencies === b.dependencies,
});

export function usePersistedUnitDetailPanels(): [UnitDetailPanelsState, (key: UnitDetailPanelKey, open: boolean) => void] {
    const [panels, persist] = useSyncedJsonLocalStorageStore(unitDetailPanelsStore);

    const setPanelOpen = useCallback(
        (key: UnitDetailPanelKey, open: boolean) => {
            persist((prev) => ({ ...prev, [key]: open }));
        },
        [persist],
    );

    return [panels, setPanelOpen];
}
