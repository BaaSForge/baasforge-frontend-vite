"use client";

import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

export type ExpandableFullReadTriggerProps = {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel: string;
    children: React.ReactNode;
    className?: string;
};

/**
 * Full-size overlay for a `relative` parent with a **named** Tailwind group, e.g.
 * `group/expandable-read` on the same wrapper. (Unnamed `group` would match any
 * ancestor `group` (e.g. the app sidebar root) and light up every card at once.)
 */
export function ExpandableFullReadTrigger({ onClick, ariaLabel, children, className }: ExpandableFullReadTriggerProps) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className={cn(
                "absolute inset-0 z-[2] flex flex-row items-center justify-center gap-1.5 border-0 p-0 text-xs font-medium shadow-none",
                "pointer-events-auto cursor-pointer",
                "bg-transparent text-muted-foreground opacity-0",
                "transition-[opacity,background-color] duration-150 ease-out",
                "rounded-md",
                "group-hover/expandable-read:opacity-100 group-hover/expandable-read:bg-background/90",
                "group-focus-within/expandable-read:opacity-100 group-focus-within/expandable-read:bg-background/90",
                "focus-visible:opacity-100 focus-visible:bg-background/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
            )}
        >
            <Maximize2 className="size-2.5 shrink-0" aria-hidden />
            {children}
        </button>
    );
}
