"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GitCommit } from "lucide-react";

export interface ReleaseRevisionBadgeProps {
    revision: number;
    className?: string;
}

export function ReleaseRevisionBadge({ revision, className }: ReleaseRevisionBadgeProps) {
    const title = `Release ${revision}`;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "border border-cyan-700/38 bg-cyan-600/93 font-semibold text-cyan-50 shadow-sm",
                "dark:border-cyan-700/48 dark:bg-cyan-800 dark:text-cyan-100",
                "text-[0.625rem] [&>svg]:size-2.5",
                className,
            )}
            title={title}
        >
            <GitCommit className="shrink-0 opacity-90" aria-hidden />
            Release {revision}
        </Badge>
    );
}
