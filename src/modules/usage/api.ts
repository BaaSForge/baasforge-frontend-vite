import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type { ListUsageEntriesParams, UsageCostParams, UsageCostSummary, UsageEntriesPage } from "./types";

const USAGE_ENTRIES_ENDPOINT = "/v1/platform/usage-entries";
const USAGE_COST_ENDPOINT = "/v1/platform/usage-cost";

function buildUsageQuery(params: ListUsageEntriesParams | UsageCostParams): string {
    const searchParams = new URLSearchParams();
    if ("page" in params && params.page != null) {
        searchParams.set("page", String(params.page));
    }
    if ("page_size" in params && params.page_size != null) {
        searchParams.set("page_size", String(params.page_size));
    }
    if (params.project_id) {
        searchParams.set("project_id", params.project_id);
    }
    if (params.from) {
        searchParams.set("from", params.from);
    }
    if (params.to) {
        searchParams.set("to", params.to);
    }
    const qs = searchParams.toString();
    return qs.length > 0 ? `?${qs}` : "";
}

export function getUsageEntries(params: ListUsageEntriesParams): Promise<UsageEntriesPage> {
    return apiClient.get<ApiResponse<UsageEntriesPage>>(`${USAGE_ENTRIES_ENDPOINT}${buildUsageQuery(params)}`).then((res) => {
        if (!res.data) {
            throw new Error("Usage entries response missing data");
        }
        return res.data;
    });
}

export function getUsageCost(params: UsageCostParams): Promise<UsageCostSummary> {
    return apiClient.get<ApiResponse<UsageCostSummary>>(`${USAGE_COST_ENDPOINT}${buildUsageQuery(params)}`).then((res) => {
        if (!res.data) {
            throw new Error("Usage cost response missing data");
        }
        return res.data;
    });
}
