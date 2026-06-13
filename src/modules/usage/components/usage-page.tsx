"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { FilterClearButton } from "@/components/ui/filter-clear-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeMedium } from "@/utils/time";
import { cn } from "@/lib/utils";
import { usePreferStackedLayout } from "@/hooks/use-prefer-stacked-layout";
import { ChevronLeftIcon, ChevronRightIcon, Gauge } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { formatUsageCost, formatUsageDetails, formatUsageKind } from "../format";
import type { UsageCostSummary } from "../types";
import { useUsageCostQuery, useUsageEntriesQuery } from "../queries";
import { UsageCostBreakdownChart } from "./usage-cost-breakdown-chart";
import { UsagePeriodPresetChips } from "./usage-period-preset-chips";
import { UsagePeriodRangePicker } from "./usage-period-range-picker";
import {
    DEFAULT_USAGE_PAGE,
    getDefaultUsagePeriod,
    isAllowedUsagePageSize,
    isDefaultUsagePeriod,
    mergeUsageSearchParams,
    readUsageSearchParams,
} from "../usage-search-params";

type UsagePageProps = {
    projectId?: string;
    title: string;
};

export function UsagePage({ projectId, title }: UsagePageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { from, to, page, pageSize } = readUsageSearchParams(searchParams);

    useEffect(() => {
        if (!searchParams.has("from") || !searchParams.has("to")) {
            setSearchParams(mergeUsageSearchParams(searchParams, { from, to }), { replace: true });
        }
    }, [from, searchParams, setSearchParams, to]);

    const fromIso = from.toISOString();
    const toIso = to.toISOString();

    const listParams = useMemo(
        () => ({
            page,
            page_size: pageSize,
            from: fromIso,
            to: toIso,
            ...(projectId ? { project_id: projectId } : {}),
        }),
        [fromIso, page, pageSize, projectId, toIso],
    );

    const costParams = useMemo(
        () => ({
            from: fromIso,
            to: toIso,
            ...(projectId ? { project_id: projectId } : {}),
        }),
        [fromIso, projectId, toIso],
    );

    const {
        data: costSummary,
        isLoading: costLoading,
        isError: costError,
        isFetching: costFetching,
    } = useUsageCostQuery(costParams);

    const {
        data: entriesPage,
        isLoading: entriesLoading,
        isError: entriesError,
        isFetching: entriesFetching,
    } = useUsageEntriesQuery(listParams);

    const patchUrl = useCallback(
        (patch: Parameters<typeof mergeUsageSearchParams>[1]) => {
            setSearchParams(mergeUsageSearchParams(searchParams, patch));
        },
        [searchParams, setSearchParams],
    );

    const applyPeriod = (nextFrom: Date, nextTo: Date) => {
        if (nextFrom >= nextTo) return;
        patchUrl({ from: nextFrom, to: nextTo, page: DEFAULT_USAGE_PAGE });
    };

    const total = entriesPage?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const entries = entriesPage?.entries ?? [];
    const showChartPanel = costLoading || costSummary != null;
    const hasActiveFilters = !isDefaultUsagePeriod(from, to);
    const stackedLayout = usePreferStackedLayout();

    const clearFilters = () => {
        const defaults = getDefaultUsagePeriod();
        patchUrl({ from: defaults.from, to: defaults.to, page: DEFAULT_USAGE_PAGE });
    };

    return (
        <>
            <PageTitleBox title={title} />
            <Container className="flex flex-col gap-4">
                <div
                    className={cn(
                        "flex gap-4",
                        stackedLayout ? "flex-col" : "flex-row items-stretch",
                    )}
                >
                    <div
                        className={cn(
                            "flex min-w-0 flex-col items-start gap-4 rounded-xl border bg-card p-4 sm:p-5",
                            stackedLayout || !showChartPanel ? "w-full" : "w-1/2",
                            costFetching && !showChartPanel && "opacity-70",
                        )}
                    >
                        <div className="flex w-full min-w-0 flex-col gap-2">
                            <SectionTitle id="usage-period-range-label" className="mb-0 text-base text-foreground">
                                Period
                            </SectionTitle>
                            <div className="flex w-full items-center gap-2">
                                <UsagePeriodRangePicker
                                    from={from}
                                    to={to}
                                    onPeriodChange={applyPeriod}
                                    showLabel={false}
                                />
                                {hasActiveFilters ? <FilterClearButton size="icon" onClear={clearFilters} /> : null}
                            </div>
                            <UsagePeriodPresetChips from={from} to={to} onPeriodChange={applyPeriod} />
                        </div>

                        <div className="mt-6 w-full">
                            <UsageCostSummaryPanel
                                costSummary={costSummary}
                                costLoading={costLoading}
                                costError={costError}
                                costFetching={costFetching && !showChartPanel}
                            />
                        </div>
                    </div>

                    {showChartPanel ? (
                        <div
                            className={cn(
                                "flex min-w-0 flex-col rounded-xl border bg-card p-4 sm:p-5",
                                stackedLayout ? "w-full" : "w-1/2",
                                costFetching && !costLoading && "opacity-70",
                            )}
                        >
                            <UsageCostBreakdownChart
                                costSummary={costSummary}
                                isLoading={costLoading}
                            />
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                    <SectionTitle className="mb-0 text-foreground">Usage entries</SectionTitle>
                    <div className="overflow-x-auto">
                        {entriesLoading ? (
                            <ContentLoadingState label="Loading usage entries…" />
                        ) : entriesError ? (
                            <ContentErrorState title="Failed to load usage entries." subtitle="Try adjusting the period and try again." />
                        ) : entries.length === 0 ? (
                            <ContentEmptyState
                                title="No usage entries"
                                description="No usage was recorded for this period."
                                icon={Gauge}
                            />
                        ) : (
                            <Table className={entriesFetching ? "opacity-70" : undefined}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recorded</TableHead>
                                        {!projectId ? <TableHead>Project</TableHead> : null}
                                        <TableHead>Kind</TableHead>
                                        <TableHead>Metric</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead>Price unit</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="whitespace-nowrap">{formatDateTimeMedium(entry.recorded_at)}</TableCell>
                                            {!projectId ? (
                                                <TableCell className="font-mono text-xs">{entry.project_id.slice(0, 8)}…</TableCell>
                                            ) : null}
                                            <TableCell>{formatUsageKind(entry.kind)}</TableCell>
                                            <TableCell className="font-mono text-xs">{entry.metric}</TableCell>
                                            <TableCell className="text-right tabular-nums">{entry.quantity.toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-xs">{entry.price_unit}</TableCell>
                                            <TableCell className="max-w-[16rem] truncate text-xs text-muted-foreground">
                                                {formatUsageDetails(entry.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {totalPages > 1 || total > 0 ? (
                        <div className="text-muted-foreground flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <span>
                                    Page <span className="text-foreground font-medium">{page}</span> of {totalPages}
                                    <span className="mx-1.5">·</span>
                                    {total} entr{total === 1 ? "y" : "ies"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={page <= 1 || entriesFetching}
                                        onClick={() => patchUrl({ page: Math.max(1, page - 1) })}
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeftIcon className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={page >= totalPages || entriesFetching}
                                        onClick={() => patchUrl({ page: Math.min(totalPages, page + 1) })}
                                        aria-label="Next page"
                                    >
                                        <ChevronRightIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap">Page size</span>
                                <NativeSelect
                                    size="sm"
                                    className="w-[4.5rem]"
                                    value={String(pageSize)}
                                    onChange={(e) => {
                                        const next = Number.parseInt(e.target.value, 10);
                                        if (!isAllowedUsagePageSize(next)) return;
                                        patchUrl({ pageSize: next, page: DEFAULT_USAGE_PAGE });
                                    }}
                                >
                                    <NativeSelectOption value="10">10</NativeSelectOption>
                                    <NativeSelectOption value="20">20</NativeSelectOption>
                                    <NativeSelectOption value="50">50</NativeSelectOption>
                                    <NativeSelectOption value="100">100</NativeSelectOption>
                                </NativeSelect>
                            </div>
                        </div>
                    ) : null}
                </div>
            </Container>
        </>
    );
}

type UsageCostSummaryPanelProps = {
    costSummary?: UsageCostSummary;
    costLoading: boolean;
    costError: boolean;
    costFetching: boolean;
};

function UsageCostSummaryPanel({ costSummary, costLoading, costError, costFetching }: UsageCostSummaryPanelProps) {
    if (costLoading) {
        return <ContentLoadingState size="compact" label="Calculating usage cost…" />;
    }

    if (costError) {
        return (
            <ContentErrorState
                size="compact"
                title="Failed to load usage cost."
                subtitle="Try adjusting the period and try again."
            />
        );
    }

    if (!costSummary) {
        return (
            <ContentEmptyState
                size="compact"
                title="No usage cost"
                description="No usage recorded for this period."
                icon={Gauge}
            />
        );
    }

    return (
        <div className={cn("flex flex-col gap-1", costFetching && "opacity-70")}>
            <p className="text-muted-foreground text-sm">Total cost</p>
            <p className="text-2xl font-semibold tracking-tight">{formatUsageCost(costSummary.total_cost)}</p>
            <p className="text-muted-foreground text-xs">Package tier {costSummary.package_tier}</p>
        </div>
    );
}
