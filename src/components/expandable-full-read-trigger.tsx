"use client";

import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

export type ExpandableFullReadTriggerProps = {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel: string;
    children?: React.ReactNode;
    className?: string;
    variant?: "overlay" | "corner-icon";
    disabled?: boolean;
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
    disabled = false,
}: ExpandableFullReadTriggerProps) {
    const corner = variant === "corner-icon";

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onClick(e);
            }}
            className={cn(
                corner
                    ? "absolute bottom-1 right-1 z-[2] flex size-7 shrink-0 items-center justify-center border-0 p-0 shadow-none"
                    : "absolute inset-0 z-[2] flex flex-row items-center justify-center gap-1.5 border-0 p-0 text-xs font-medium shadow-none",
                "pointer-events-auto cursor-pointer",
                "transition-[opacity,background-color,border-color] duration-150 ease-out",
                "rounded-md",
                corner
                    ? [
                          "text-foreground opacity-100 border border-border/80 bg-muted",
                          "md:opacity-0 md:border-transparent md:bg-transparent",
                          "md:group-hover/expandable-read:opacity-100 md:group-hover/expandable-read:border-border/80 md:group-hover/expandable-read:bg-muted",
                          "md:group-focus-within/expandable-read:opacity-100 md:group-focus-within/expandable-read:border-border/80 md:group-focus-within/expandable-read:bg-muted",
                          "md:focus-visible:opacity-100 md:focus-visible:border-border/80 md:focus-visible:bg-muted",
                      ]
                    : [
                          "bg-transparent text-muted-foreground opacity-0",
                          "group-hover/expandable-read:opacity-100 group-hover/expandable-read:bg-background/90",
                          "group-focus-within/expandable-read:opacity-100 group-focus-within/expandable-read:bg-background/90",
                          "focus-visible:opacity-100 focus-visible:bg-background/90",
                      ],
                disabled && "pointer-events-none cursor-not-allowed opacity-40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
            )}
        >
            <Maximize2 className={cn("shrink-0", corner ? "size-3.5" : "size-2.5")} aria-hidden />
            {children}
        </button>
    );
}

export function ExpandableReadMobileTapLayer({
    onOpen,
    className,
    disabled = false,
}: {
    onOpen: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            tabIndex={-1}
            aria-hidden
            disabled={disabled}
            className={cn(
                "absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0 md:hidden",
                disabled && "pointer-events-none cursor-not-allowed opacity-40",
                className,
            )}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onOpen();
            }}
        />
    );
}

export type ExpandableFullReadResponsiveControlsProps = {
    ariaLabel: string;
    onOpen: () => void;
    cornerTriggerClassName?: string;
    overlayTriggerClassName?: string;
    overlayChildren?: ReactNode;
    disabled?: boolean;
};

export function ExpandableFullReadResponsiveControls({
    ariaLabel,
    onOpen,
    cornerTriggerClassName,
    overlayTriggerClassName,
    overlayChildren = "Expand",
    disabled = false,
}: ExpandableFullReadResponsiveControlsProps) {
    return (
        <>
            <ExpandableReadMobileTapLayer onOpen={onOpen} disabled={disabled} />
            <ExpandableFullReadTrigger
                variant="corner-icon"
                ariaLabel={ariaLabel}
                className={cn("md:hidden", cornerTriggerClassName)}
                onClick={() => onOpen()}
                disabled={disabled}
            />
            <ExpandableFullReadTrigger
                ariaLabel={ariaLabel}
                className={cn("hidden md:flex", overlayTriggerClassName)}
                onClick={() => onOpen()}
                disabled={disabled}
            >
                {overlayChildren}
            </ExpandableFullReadTrigger>
        </>
    );
}
