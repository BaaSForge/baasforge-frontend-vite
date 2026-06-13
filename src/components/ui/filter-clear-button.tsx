"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterXIcon } from "lucide-react";

export function FilterClearButton({
    onClear,
    size = "icon-sm",
    "aria-label": ariaLabel = "Clear filters",
    tooltip = "Clear filters",
}: {
    onClear: () => void;
    size?: ButtonProps["size"];
    "aria-label"?: string;
    tooltip?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex shrink-0">
                    <Button type="button" variant="destructive" size={size} onClick={onClear} aria-label={ariaLabel}>
                        <FilterXIcon className="size-3.5 shrink-0" />
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </Tooltip>
    );
}
