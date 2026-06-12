import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getUsageCost, getUsageEntries } from "./api";
import type { ListUsageEntriesParams, UsageCostParams } from "./types";

export function useUsageEntriesQuery(params: ListUsageEntriesParams, enabled = true) {
    return useQuery({
        queryKey: QueryKeys.usageEntries(params),
        queryFn: () => getUsageEntries(params),
        enabled: enabled && Boolean(params.from && params.to),
    });
}

export function useUsageCostQuery(params: UsageCostParams, enabled = true) {
    return useQuery({
        queryKey: QueryKeys.usageCost(params),
        queryFn: () => getUsageCost(params),
        enabled: enabled && Boolean(params.from && params.to),
    });
}
