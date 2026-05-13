"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BadgeCheck, FlaskConical } from "lucide-react";

const headerIconClass =
    "text-muted-foreground shrink-0 bg-muted/45 hover:bg-muted/65 dark:bg-muted/35 dark:hover:bg-muted/55";

export type AllUnitsFlagTestedIconButtonProps = {
    flagged: boolean;
    onToggle: () => void;
    className?: string;
};

export function AllUnitsFlagTestedIconButton({ flagged, onToggle, className }: AllUnitsFlagTestedIconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={cn(headerIconClass, className)}
                    aria-pressed={flagged}
                    aria-label={flagged ? "Clear tested mark" : "Flag as tested"}
                    onClick={() => {
                        void onToggle();
                    }}
                >
                    {flagged ? (
                        <BadgeCheck className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    ) : (
                        <FlaskConical className="size-3 shrink-0" aria-hidden />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
                {flagged ? "Marked as tested — click to clear" : "Flag as tested after you verify this unit"}
            </TooltipContent>
        </Tooltip>
    );
}
