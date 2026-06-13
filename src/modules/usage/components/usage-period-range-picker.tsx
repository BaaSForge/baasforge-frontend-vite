"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SectionTitle } from "@/components/section-title";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import { type DateRange } from "react-day-picker";
import { dateRangeToPeriod, periodToDateRange } from "../usage-search-params";

type UsagePeriodRangePickerProps = {
    from: Date;
    to: Date;
    onPeriodChange: (from: Date, to: Date) => void;
    className?: string;
    showLabel?: boolean;
};

export function UsagePeriodRangePicker({ from, to, onPeriodChange, className, showLabel = true }: UsagePeriodRangePickerProps) {
    const selected = useMemo(() => periodToDateRange(from, to), [from, to]);

    const onSelect = (range: DateRange | undefined) => {
        const period = dateRangeToPeriod(range ?? {});
        if (!period) return;
        onPeriodChange(period.from, period.to);
    };

    const trigger = (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="usage-period-range"
                    aria-labelledby={showLabel ? "usage-period-range-label" : undefined}
                    className="w-full justify-start px-2.5 font-normal"
                >
                    <CalendarIcon className="size-4" />
                    {format(selected.from, "LLL dd, y")} – {format(selected.to, "LLL dd, y")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={selected.from}
                    selected={selected}
                    onSelect={onSelect}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );

    if (!showLabel) {
        return <div className={cn("min-w-0 flex-1", className)}>{trigger}</div>;
    }

    return (
        <Field className={cn("w-full", className)}>
            <SectionTitle id="usage-period-range-label" className="mb-0 text-base text-foreground">
                Period
            </SectionTitle>
            {trigger}
        </Field>
    );
}
