"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UnitRejectedBadge({ className }: { className?: string }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[0.625rem] font-normal capitalize border-muted-foreground/40 bg-muted/40 text-muted-foreground shadow-none",
                className,
            )}
        >
            rejected
        </Badge>
    );
}
