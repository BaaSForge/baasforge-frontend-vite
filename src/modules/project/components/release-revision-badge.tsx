"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ReleaseRevisionBadgeProps {
    revision: number;
    className?: string;
}

export function ReleaseRevisionBadge({ revision, className }: ReleaseRevisionBadgeProps) {
    const title = `revision ${revision}`;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "border border-cyan-700/38 bg-cyan-600/93 font-semibold text-cyan-50 shadow-sm",
                "dark:border-cyan-700/48 dark:bg-cyan-800 dark:text-cyan-100",
                "text-[0.625rem]",
                className,
            )}
            title={title}
        >
            revision {revision}
        </Badge>
    );
}
