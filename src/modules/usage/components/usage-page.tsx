"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeMedium } from "@/utils/time";
import { ChevronLeftIcon, ChevronRightIcon, Gauge } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { formatUsageCost, formatUsageDetails, formatUsageKind } from "../format";
import { useUsageCostQuery, useUsageEntriesQuery } from "../queries";
import { UsagePeriodRangePicker } from "./usage-period-range-picker";
import {
    DEFAULT_USAGE_PAGE,
    isAllowedUsagePageSize,
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

    return (
        <>
            <PageTitleBox title={title} />
            <Container className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                    <UsagePeriodRangePicker from={from} to={to} onPeriodChange={applyPeriod} />

                    <div className="min-w-0 sm:max-w-md sm:text-right">
                        {costLoading ? (
                            <ContentLoadingState size="compact" label="Calculating usage cost…" className="sm:justify-end" />
                        ) : costError ? (
                            <ContentErrorState
                                size="compact"
                                title="Failed to load usage cost."
                                subtitle="Try adjusting the period and try again."
                                className="sm:ml-auto"
                            />
                        ) : costSummary ? (
                            <div className={costFetching ? "opacity-70" : undefined}>
                                <div className="flex flex-col gap-1 sm:items-end">
                                    <p className="text-muted-foreground text-sm">Total cost</p>
                                    <p className="text-3xl font-semibold tracking-tight">{formatUsageCost(costSummary.total_cost)}</p>
                                    <p className="text-muted-foreground text-xs">Package tier {costSummary.package_tier}</p>
                                </div>
                                {costSummary.breakdown.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
                                        {costSummary.breakdown.map((item) => (
                                            <Badge key={item.kind} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
                                                <span>{formatUsageKind(item.kind)}</span>
                                                <span className="text-foreground font-medium">{formatUsageCost(item.cost)}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <ContentEmptyState
                                size="compact"
                                title="No usage cost"
                                description="No usage recorded for this period."
                                icon={Gauge}
                                className="sm:ml-auto"
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                    <h2 className="text-sm font-medium">Usage entries</h2>
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
