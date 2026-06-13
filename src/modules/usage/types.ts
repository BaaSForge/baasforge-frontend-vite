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

export interface UsageCostSummary {
    byte_hours_active: number;
    byte_hours_retained: number;
    compute_cost: number;
    llm_input_cost: number;
    llm_output_cost: number;
    package_tier: number;
    period: UsagePeriod;
    project_cost: number;
    stage_runtime_cost: number;
    storage_cold_cost: number;
    storage_hot_cost: number;
    subscription_cost: number;
    sum_gb_ms: number;
    total_cost: number;
    unit_cost: number;
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
