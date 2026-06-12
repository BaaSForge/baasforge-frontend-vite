"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import { type DateRange } from "react-day-picker";
import { dateRangeToPeriod, periodToDateRange } from "../usage-search-params";

type UsagePeriodRangePickerProps = {
    from: Date;
    to: Date;
    onPeriodChange: (from: Date, to: Date) => void;
};

export function UsagePeriodRangePicker({ from, to, onPeriodChange }: UsagePeriodRangePickerProps) {
    const selected = useMemo(() => periodToDateRange(from, to), [from, to]);

    const onSelect = (range: DateRange | undefined) => {
        const period = dateRangeToPeriod(range ?? {});
        if (!period) return;
        onPeriodChange(period.from, period.to);
    };

    return (
        <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="usage-period-range">Period</FieldLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" id="usage-period-range" className="w-full justify-start px-2.5 font-normal">
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
        </Field>
    );
}
