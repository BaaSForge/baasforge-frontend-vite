"use client";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import { formatUsageCost, formatUsageKind } from "../format";
import type { UsageCostSummary } from "../types";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;

const COST_SEGMENTS = [
    { kind: "compute_cost", getCost: (summary: UsageCostSummary) => summary.compute_cost },
    { kind: "llm_input_cost", getCost: (summary: UsageCostSummary) => summary.llm_input_cost },
    { kind: "llm_output_cost", getCost: (summary: UsageCostSummary) => summary.llm_output_cost },
    { kind: "storage_cold_cost", getCost: (summary: UsageCostSummary) => summary.storage_cold_cost },
    { kind: "storage_hot_cost", getCost: (summary: UsageCostSummary) => summary.storage_hot_cost },
] as const;

type UsageCostBreakdownChartProps = {
    costSummary: UsageCostSummary;
    className?: string;
};

export function UsageCostBreakdownChart({ costSummary, className }: UsageCostBreakdownChartProps) {
    const { chartData, chartConfig } = useMemo(() => {
        const config: ChartConfig = {
            cost: { label: "Cost" },
        };

        const segments = COST_SEGMENTS.map(({ kind, getCost }) => ({ kind, cost: getCost(costSummary) })).filter(
            (segment) => segment.cost > 0,
        );

        const data = segments.map((item, index) => {
            const color = CHART_COLORS[index % CHART_COLORS.length];
            config[item.kind] = {
                label: formatUsageKind(item.kind),
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

    if (chartData.length === 0) {
        return null;
    }

    return (
        <ChartContainer
            config={chartConfig}
            className={cn(
                "aspect-auto h-[min(220px,55vw)] w-full max-w-[300px] shrink-0 sm:h-[220px] sm:max-w-[300px]",
                className,
            )}
        >
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            nameKey="kind"
                            labelKey="kind"
                            formatter={(value) => <span className="font-mono font-medium tabular-nums">{formatUsageCost(Number(value))}</span>}
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
                    content={<ChartLegendContent nameKey="kind" className="flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 *:gap-1.5" />}
                />
            </PieChart>
        </ChartContainer>
    );
}
