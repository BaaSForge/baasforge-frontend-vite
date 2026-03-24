"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/** Matches scroll-area fades: gradient from this color to transparent. */
export const SCROLL_EDGE_FADER_DEFAULT_FROM = "from-background";

export type ScrollEdgeFaderEdge = "top" | "bottom" | "left" | "right";

export type ScrollEdgeFaderProps = Omit<React.ComponentProps<"div">, "children"> & {
    edge: ScrollEdgeFaderEdge;
    /** Tailwind gradient start, e.g. `from-background`, `from-sidebar`, `from-card`. */
    fromClassName?: string;
};

const EDGE_STYLES: Record<ScrollEdgeFaderEdge, string> = {
    top: "top-0 left-0 right-0 h-8 bg-gradient-to-b to-transparent",
    bottom: "bottom-0 left-0 right-0 h-8 bg-gradient-to-t to-transparent",
    left: "left-0 top-0 bottom-0 w-8 bg-gradient-to-r to-transparent",
    right: "right-0 top-0 bottom-0 w-8 bg-gradient-to-l to-transparent",
};

export const ScrollEdgeFader = React.forwardRef<HTMLDivElement, ScrollEdgeFaderProps>(function ScrollEdgeFader(
    { edge, fromClassName = SCROLL_EDGE_FADER_DEFAULT_FROM, className, ...props },
    ref,
) {
    return (
        <div
            ref={ref}
            className={cn(
                "pointer-events-none absolute z-5 transition-opacity duration-150",
                EDGE_STYLES[edge],
                fromClassName,
                className,
            )}
            aria-hidden
            {...props}
        />
    );
});
