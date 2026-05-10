"use client";

import { cn } from "@/lib/utils";

import { StartDebugModalBgGraphic } from "./start-debug-modal-bg-graphic";

export type StartDebugModalBgIllustrationProps = {
    className?: string;
    /** Passed to the inner `<svg>` via wrapper; defaults to theme `muted` via `text-muted`. */
    colorClassName?: string;
};

export function StartDebugModalBgIllustration({ className, colorClassName }: StartDebugModalBgIllustrationProps) {
    return (
        <div
            className={cn(
                "pointer-events-none h-full min-h-0 w-full text-muted [&_svg]:block [&_svg]:h-full [&_svg]:min-h-full [&_svg]:w-full [&_svg]:max-w-none",
                "[.light_&]:opacity-80 [.dark-default_&]:opacity-20 [.dark-midnight_&]:opacity-10",
                colorClassName,
                className,
            )}
        >
            <StartDebugModalBgGraphic />
        </div>
    );
}
