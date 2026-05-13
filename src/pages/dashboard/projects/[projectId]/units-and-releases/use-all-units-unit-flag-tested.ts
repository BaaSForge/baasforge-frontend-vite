"use client";

import type { ProjectUnitResponse } from "@/modules/project/types";
import {
    getAllUnitsFlagTestedAndTouch,
    subscribeAllUnitsFlagTested,
    toggleAllUnitsFlagTested,
} from "@/modules/project/all-units-flag-tested-service";
import { useCallback, useEffect, useState } from "react";

export function useAllUnitsUnitFlagTested(projectId: string, unit: ProjectUnitResponse) {
    const [flagged, setFlagged] = useState(false);

    useEffect(() => {
        let alive = true;
        async function sync() {
            const on = await getAllUnitsFlagTestedAndTouch(projectId, unit.chat_session_id, unit.id);
            if (!alive) return;
            setFlagged(on);
        }
        void sync();
        const unsub = subscribeAllUnitsFlagTested(() => {
            void sync();
        });
        return () => {
            alive = false;
            unsub();
        };
    }, [projectId, unit.id, unit.chat_session_id]);

    const toggle = useCallback(async () => {
        const next = await toggleAllUnitsFlagTested(projectId, unit);
        setFlagged(next);
    }, [projectId, unit]);

    return { flagged, toggle };
}
