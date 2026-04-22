"use client";

import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

export type ExpandableFullReadTriggerProps = {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel: string;
    children?: React.ReactNode;
    className?: string;
    variant?: "overlay" | "corner-icon";
};

/**
 * Hover/focus affordance on a `relative` parent with **named** `group/expandable-read`.
 * `overlay` covers the area; `corner-icon` is a bottom-right icon-only control.
 */
export function ExpandableFullReadTrigger({
    onClick,
    ariaLabel,
    children,
    className,
    variant = "overlay",
}: ExpandableFullReadTriggerProps) {
    const corner = variant === "corner-icon";

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className={cn(
                corner
                    ? "absolute bottom-1 right-1 z-[2] flex size-7 shrink-0 items-center justify-center border-0 p-0 shadow-none"
                    : "absolute inset-0 z-[2] flex flex-row items-center justify-center gap-1.5 border-0 p-0 text-xs font-medium shadow-none",
                "pointer-events-auto cursor-pointer",
                "transition-[opacity,background-color] duration-150 ease-out",
                "rounded-md",
                corner
                    ? [
                          "text-muted-foreground opacity-100 bg-background/90",
                          "md:opacity-0 md:bg-transparent",
                          "md:group-hover/expandable-read:opacity-100 md:group-hover/expandable-read:bg-background/90",
                          "md:group-focus-within/expandable-read:opacity-100 md:group-focus-within/expandable-read:bg-background/90",
                          "md:focus-visible:opacity-100 md:focus-visible:bg-background/90",
                      ]
                    : [
                          "bg-transparent text-muted-foreground opacity-0",
                          "group-hover/expandable-read:opacity-100 group-hover/expandable-read:bg-background/90",
                          "group-focus-within/expandable-read:opacity-100 group-focus-within/expandable-read:bg-background/90",
                          "focus-visible:opacity-100 focus-visible:bg-background/90",
                      ],
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
            )}
        >
            <Maximize2 className={cn("shrink-0", corner ? "size-3.5" : "size-2.5")} aria-hidden />
            {children}
        </button>
    );
}
