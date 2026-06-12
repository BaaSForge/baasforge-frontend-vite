export interface UsagePeriod {
    from: string | null;
    to: string | null;
}

export interface ProjectUsageEntry {
    id: string;
    project_id: string;
    recorded_at: string;
    kind: string;
    metric: string;
    quantity: number;
    price_unit: string;
    details: Record<string, unknown>;
}

export interface UsageEntriesPage {
    entries: ProjectUsageEntry[];
    total: number;
    page: number;
    page_size: number;
    period: UsagePeriod;
}

export interface UsageCostKindBreakdown {
    kind: string;
    cost: number;
}

export interface UsageCostSummary {
    package_tier: number;
    period: UsagePeriod;
    breakdown: UsageCostKindBreakdown[];
    total_cost: number;
}

export interface ListUsageEntriesParams {
    page?: number;
    page_size?: number;
    project_id?: string;
    from?: string;
    to?: string;
}

export interface UsageCostParams {
    project_id?: string;
    from?: string;
    to?: string;
}
