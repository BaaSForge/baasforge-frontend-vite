"use client";

import { QueryKeys } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addAllUnitsPin, clearAllUnitsPins, listAllUnitsPins, removeAllUnitsPin, subscribeAllUnitsPins, type AllUnitsPinPersisted } from "./all-units-pins-service";
import type { ProjectUnitResponse } from "./types";

export function useAllUnitsPins(projectId: string, runtimeKey: string) {
    const [pins, setPins] = useState<AllUnitsPinPersisted[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        let cancelled = false;
        void listAllUnitsPins(projectId, runtimeKey).then((r) => {
            if (!cancelled) setPins(r);
        });
        const unsub = subscribeAllUnitsPins(() => {
            void listAllUnitsPins(projectId, runtimeKey).then((r) => {
                if (!cancelled) setPins(r);
            });
        });
        return () => {
            cancelled = true;
            unsub();
        };
    }, [projectId, runtimeKey]);

    const pathSet = useMemo(() => new Set(pins.map((p) => p.path)), [pins]);

    const invalidateReleaseUnitsAll = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleaseUnitsAllByProject(projectId) });
    }, [queryClient, projectId]);

    const pin = useCallback(
        async (unit: ProjectUnitResponse) => {
            await addAllUnitsPin(projectId, runtimeKey, unit);
            invalidateReleaseUnitsAll();
        },
        [projectId, runtimeKey, invalidateReleaseUnitsAll],
    );

    const unpinPath = useCallback(
        async (path: string) => {
            await removeAllUnitsPin(projectId, runtimeKey, path);
            invalidateReleaseUnitsAll();
        },
        [projectId, runtimeKey, invalidateReleaseUnitsAll],
    );

    const clearAll = useCallback(async () => {
        await clearAllUnitsPins(projectId, runtimeKey);
        invalidateReleaseUnitsAll();
    }, [projectId, runtimeKey, invalidateReleaseUnitsAll]);

    return { pins, pathSet, pin, unpinPath, clearAll };
}
