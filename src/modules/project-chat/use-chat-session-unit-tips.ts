import { QueryKeys } from "@/constants/query-keys";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getChatSessionUnitTipsByIds } from "./api";

export function useChatSessionUnitTipsFresh(
    projectId: string | undefined,
    chatSessionId: string | undefined,
    initialUnits: ProjectUnitResponse[],
    enabled: boolean,
): { units: ProjectUnitResponse[]; isRefreshing: boolean } {
    const unitIds = useMemo(() => initialUnits.map((u) => u.id), [initialUnits]);

    const query = useQuery({
        queryKey: QueryKeys.chatSessionUnitTips(projectId ?? "", chatSessionId ?? "", unitIds),
        queryFn: () => getChatSessionUnitTipsByIds(projectId!, chatSessionId!, unitIds),
        enabled: enabled && unitIds.length > 0 && projectId != null && chatSessionId != null,
        staleTime: 60_000,
    });

    const units = useMemo(() => {
        const data = query.data;
        if (!Array.isArray(data) || data.length === 0) {
            return initialUnits;
        }
        const byId = new Map<string, ProjectUnitResponse>();
        for (const u of data) {
            byId.set(u.id, u);
        }
        return initialUnits.map((u) => byId.get(u.id) ?? u);
    }, [initialUnits, query.data]);

    const isRefreshing = enabled && unitIds.length > 0 && query.isFetching;

    return { units, isRefreshing };
}
