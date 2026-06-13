"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    getUsagePeriodPreset,
    isSameUsagePeriod,
    USAGE_PERIOD_PRESETS,
} from "../usage-search-params";

type UsagePeriodPresetChipsProps = {
    from: Date;
    to: Date;
    onPeriodChange: (from: Date, to: Date) => void;
    className?: string;
};

export function UsagePeriodPresetChips({ from, to, onPeriodChange, className }: UsagePeriodPresetChipsProps) {
    const current = { from, to };

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {USAGE_PERIOD_PRESETS.map(({ id, label }) => {
                const preset = getUsagePeriodPreset(id);
                const isActive = isSameUsagePeriod(current, preset);

                return (
                    <Badge
                        key={id}
                        asChild
                        variant={isActive ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer rounded-full px-2.5 py-1",
                            !isActive && "hover:bg-accent hover:text-accent-foreground",
                            isActive && "shadow-sm ring-2 ring-primary/25",
                        )}
                    >
                        <button
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onPeriodChange(preset.from, preset.to)}
                        >
                            {label}
                        </button>
                    </Badge>
                );
            })}
        </div>
    );
}
