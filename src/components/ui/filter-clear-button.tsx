"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterXIcon } from "lucide-react";

export function FilterClearButton({
    onClear,
    "aria-label": ariaLabel = "Clear filters",
    tooltip = "Clear filters",
}: {
    onClear: () => void;
    "aria-label"?: string;
    tooltip?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex shrink-0">
                    <Button type="button" variant="destructive" size="icon-sm" onClick={onClear} aria-label={ariaLabel}>
                        <FilterXIcon className="size-3.5 shrink-0" />
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </Tooltip>
    );
}
