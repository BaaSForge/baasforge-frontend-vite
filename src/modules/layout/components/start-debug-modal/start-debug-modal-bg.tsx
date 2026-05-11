"use client";

import { cn } from "@/lib/utils";

import { StartDebugModalBgGraphic } from "./start-debug-modal-bg-graphic";

export type StartDebugModalBgIllustrationProps = {
    className?: string;
    /** Passed to the inner `<svg>` via wrapper `currentColor`; defaults to a muted orange aligned with the Debug toolbar (see `debugToolbarActiveToneClassName`). */
    colorClassName?: string;
};

export function StartDebugModalBgIllustration({ className, colorClassName }: StartDebugModalBgIllustrationProps) {
    return (
        <div
            className={cn(
                "pointer-events-none h-full min-h-0 w-full [.light_&]:text-orange-950/10 [.dark-default_&]:text-orange-200/14 [.dark-midnight_&]:text-orange-200/11 [&_svg]:block [&_svg]:h-full [&_svg]:min-h-full [&_svg]:w-full [&_svg]:max-w-none",
                "[.light_&]:opacity-40 [.dark-default_&]:opacity-14 [.dark-midnight_&]:opacity-7",
                colorClassName,
                className,
            )}
        >
            <StartDebugModalBgGraphic />
        </div>
    );
}
