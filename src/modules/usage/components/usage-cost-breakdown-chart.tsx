"use client";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import { formatUsageCost, formatUsageKind } from "../format";
import type { UsageCostKindBreakdown } from "../types";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;

type UsageCostBreakdownChartProps = {
    breakdown: UsageCostKindBreakdown[];
    className?: string;
};

export function UsageCostBreakdownChart({ breakdown, className }: UsageCostBreakdownChartProps) {
    const { chartData, chartConfig } = useMemo(() => {
        const config: ChartConfig = {
            cost: { label: "Cost" },
        };

        const data = breakdown.map((item, index) => {
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
    }, [breakdown]);

    if (breakdown.length === 0) {
        return null;
    }

    return (
        <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto h-[min(160px,40vw)] w-full max-w-[160px] shrink-0 sm:h-[150px] sm:max-w-[150px]", className)}
        >
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            hideLabel
                            nameKey="kind"
                            formatter={(value) => <span className="font-mono font-medium tabular-nums">{formatUsageCost(Number(value))}</span>}
                        />
                    }
                />
                <Pie data={chartData} dataKey="cost" nameKey="kind" innerRadius="40%" strokeWidth={2} />
                <ChartLegend content={<ChartLegendContent nameKey="kind" className="pt-1 *:gap-1.5" />} />
            </PieChart>
        </ChartContainer>
    );
}
