"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import { formatUsageCost, formatUsageCostSegment } from "../format";
import type { UsageCostSummary } from "../types";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
] as const;

const COST_SEGMENTS = [
    { kind: "compute_cost", getCost: (summary: UsageCostSummary) => summary.compute_cost },
    { kind: "llm_input_cost", getCost: (summary: UsageCostSummary) => summary.llm_input_cost },
    { kind: "llm_output_cost", getCost: (summary: UsageCostSummary) => summary.llm_output_cost },
    { kind: "subscription_cost", getCost: (summary: UsageCostSummary) => summary.subscription_cost },
    { kind: "project_cost", getCost: (summary: UsageCostSummary) => summary.project_cost },
    { kind: "unit_cost", getCost: (summary: UsageCostSummary) => summary.unit_cost },
    { kind: "stage_runtime_cost", getCost: (summary: UsageCostSummary) => summary.stage_runtime_cost },
    { kind: "storage_cold_cost", getCost: (summary: UsageCostSummary) => summary.storage_cold_cost },
    { kind: "storage_hot_cost", getCost: (summary: UsageCostSummary) => summary.storage_hot_cost },
] as const;

export function hasUsageCostBreakdown(summary: UsageCostSummary): boolean {
    return COST_SEGMENTS.some(({ getCost }) => getCost(summary) > 0);
}

const CHART_SIZE_CLASSNAME =
    "aspect-auto h-[min(260px,60vw)] w-full shrink-0 sm:min-h-[260px] sm:h-[260px]";

type UsageCostBreakdownChartProps = {
    costSummary?: UsageCostSummary;
    isLoading?: boolean;
    className?: string;
};

export function UsageCostBreakdownChart({ costSummary, isLoading = false, className }: UsageCostBreakdownChartProps) {
    const { chartData, chartConfig } = useMemo(() => {
        const config: ChartConfig = {
            cost: { label: "Cost" },
        };

        if (!costSummary) {
            return { chartData: [], chartConfig: config };
        }

        const segments = COST_SEGMENTS.map(({ kind, getCost }) => ({ kind, cost: getCost(costSummary) })).filter(
            (segment) => segment.cost > 0,
        );

        const data = segments.map((item, index) => {
            const color = CHART_COLORS[index % CHART_COLORS.length];
            config[item.kind] = {
                label: formatUsageCostSegment(item.kind),
                color,
            };
            return {
                kind: item.kind,
                cost: item.cost,
                fill: `var(--color-${item.kind})`,
            };
        });

        return { chartData: data, chartConfig: config };
    }, [costSummary]);

    const legendRows = useMemo(() => {
        const rows: { left: (typeof chartData)[number]; right?: (typeof chartData)[number] }[] = [];
        for (let index = 0; index < chartData.length; index += 2) {
            rows.push({ left: chartData[index], right: chartData[index + 1] });
        }
        return rows;
    }, [chartData]);

    if (isLoading) {
        return (
            <ContentLoadingState
                className={cn(CHART_SIZE_CLASSNAME, className)}
                label="Calculating cost breakdown…"
            />
        );
    }

    if (chartData.length === 0) {
        return (
            <ContentEmptyState
                className={cn(CHART_SIZE_CLASSNAME, "justify-center", className)}
                size="compact"
                title="No cost breakdown"
                description="No usage costs were recorded for this period."
                icon={Gauge}
            />
        );
    }

    return (
        <ChartContainer
            config={chartConfig}
            className={cn(CHART_SIZE_CLASSNAME, className)}
        >
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            hideLabel
                            nameKey="kind"
                            formatter={(value, name, item) => {
                                const label = chartConfig[String(name)]?.label ?? formatUsageCostSegment(String(name));
                                const indicatorColor = item.payload?.fill ?? item.color;

                                return (
                                    <div className="flex w-full items-center gap-2">
                                        <div
                                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                            style={{ backgroundColor: indicatorColor }}
                                        />
                                        <span>
                                            <span className="text-muted-foreground">{label}:</span>{" "}
                                            <span className="font-mono font-medium tabular-nums">{formatUsageCost(Number(value))}</span>
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Pie
                    data={chartData}
                    dataKey="cost"
                    nameKey="kind"
                    cx="50%"
                    cy="42%"
                    innerRadius={30}
                    outerRadius={74}
                    strokeWidth={2}
                />
                <ChartLegend
                    content={
                        <div className="flex justify-center pt-1">
                            <table className="w-[500px] max-w-full table-fixed border-collapse border-0 text-xs [&_td]:border-0 [&_th]:border-0">
                            <colgroup>
                                <col />
                                <col style={{ width: "5.75rem" }} />
                                <col style={{ width: "0.75rem" }} />
                                <col style={{ width: "2.5rem" }} />
                                <col style={{ width: "0.75rem" }} />
                                <col />
                                <col style={{ width: "5.75rem" }} />
                            </colgroup>
                            <tbody>
                                {legendRows.map(({ left, right }) => (
                                    <tr key={left.kind}>
                                        <td className="py-0.5 text-right text-muted-foreground whitespace-nowrap">
                                            {chartConfig[left.kind]?.label}:
                                        </td>
                                        <td className="py-0.5 text-right font-mono font-medium tabular-nums whitespace-nowrap">
                                            {formatUsageCost(left.cost)}
                                        </td>
                                        <td className="py-0.5 pl-1.5 align-middle">
                                            <div
                                                className="ml-auto h-2 w-2 rounded-[2px]"
                                                style={{ backgroundColor: left.fill }}
                                            />
                                        </td>
                                        <td className="py-0.5" aria-hidden />
                                        <td className="py-0.5 pr-1.5 align-middle">
                                            {right ? (
                                                <div
                                                    className="h-2 w-2 rounded-[2px]"
                                                    style={{ backgroundColor: right.fill }}
                                                />
                                            ) : null}
                                        </td>
                                        <td className="py-0.5 text-left text-muted-foreground whitespace-nowrap">
                                            {right ? `${chartConfig[right.kind]?.label}:` : null}
                                        </td>
                                        <td className="py-0.5 text-left font-mono font-medium tabular-nums whitespace-nowrap">
                                            {right ? formatUsageCost(right.cost) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    }
                />
            </PieChart>
        </ChartContainer>
    );
}
