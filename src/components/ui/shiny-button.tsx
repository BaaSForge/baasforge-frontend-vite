"use client";

import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";
import { type ComponentProps, useId, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeToReducedMotion(callback: () => void) {
    if (typeof window === "undefined") return () => {};
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
}

function getServerReducedMotionSnapshot() {
    return false;
}

type ShinyButtonProps = ComponentProps<"button"> & {
    asChild?: boolean;
    label?: string;
    fillColor?: string;
    labelColor?: string;
    accentColor?: string;
    accentSoftColor?: string;
    sweepDuration?: number;
    easeDuration?: number;
    arcWidth?: number;
    cornerRadius?: number;
    showSpeckle?: boolean;
    showSheen?: boolean;
    speckleOpacity?: number;
};

export function ShinyButton({
    asChild = false,
    label = "Get Started",
    className,
    children,
    fillColor = "#000000",
    labelColor = "#ffffff",
    accentColor = "#ff5f00",
    accentSoftColor = "#ff9253",
    sweepDuration = 3,
    easeDuration = 0.8,
    arcWidth = 5,
    cornerRadius = 32,
    showSpeckle = true,
    showSheen = true,
    speckleOpacity = 0.4,
    ...props
}: ShinyButtonProps) {
    const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, prefersReducedMotion, getServerReducedMotionSnapshot);
    const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
    const scope = `gleam-edge-${instanceId}`;
    const Component = asChild ? Slot.Root : "button";

    const css = `
        @property --gradient-angle-${instanceId} {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
        }
        @property --gradient-angle-offset-${instanceId} {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
        }
        @property --gradient-percent-${instanceId} {
            syntax: "<percentage>";
            initial-value: ${arcWidth}%;
            inherits: false;
        }
        @property --gradient-shine-${instanceId} {
            syntax: "<color>";
            initial-value: white;
            inherits: false;
        }

        .${scope} {
            --gleam-base: ${fillColor};
            --gleam-label: ${labelColor};
            --gleam-accent: ${accentColor};
            --gleam-accent-soft: ${accentSoftColor};
            --duration: ${sweepDuration}s;
            --ease: ${easeDuration}s cubic-bezier(0.25, 1, 0.5, 1);
            --animation: gradient-angle-${instanceId} linear infinite;
            isolation: isolate;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
            outline-offset: 4px;
            padding: 1.25rem 2.5rem;
            font-size: 1.125rem;
            line-height: 1.2;
            font-weight: 500;
            border: 1px solid transparent;
            border-radius: ${cornerRadius}px;
            color: var(--gleam-label);
            background:
                linear-gradient(var(--gleam-base), var(--gleam-base)) padding-box,
                conic-gradient(
                    from calc(var(--gradient-angle-${instanceId}) - var(--gradient-angle-offset-${instanceId})),
                    transparent,
                    var(--gleam-accent) var(--gradient-percent-${instanceId}),
                    var(--gradient-shine-${instanceId}) calc(var(--gradient-percent-${instanceId}) * 2),
                    var(--gleam-accent) calc(var(--gradient-percent-${instanceId}) * 3),
                    transparent calc(var(--gradient-percent-${instanceId}) * 4)
                ) border-box;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gleam-accent) 15%, transparent);
            transition:
                --gradient-angle-offset-${instanceId} var(--ease),
                --gradient-percent-${instanceId} var(--ease),
                --gradient-shine-${instanceId} var(--ease);
        }

        .${scope}::before,
        .${scope}::after,
        .${scope} > .shiny-button-content::before {
            content: "";
            pointer-events: none;
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            translate: -50% -50%;
            border-radius: inherit;
            z-index: 0;
        }
        .${scope}:active { translate: 0 1px; }
        .${scope}:disabled { cursor: not-allowed; opacity: 0.5; }
        .${scope}::before {
            width: calc(100% - 6px);
            height: calc(100% - 6px);
            background: radial-gradient(circle at 2px 2px, white 0.5px, transparent 0) padding-box;
            background-size: 4px 4px;
            mask-image: conic-gradient(from calc(var(--gradient-angle-${instanceId}) + 45deg), black, transparent 10% 90%, black);
            opacity: ${showSpeckle ? speckleOpacity : 0};
        }
        .${scope}::after {
            --animation: shimmer-${instanceId} linear infinite;
            width: 100%;
            aspect-ratio: 1;
            background: linear-gradient(-50deg, transparent, var(--gleam-accent), transparent);
            mask-image: radial-gradient(circle at bottom, transparent 40%, black);
            opacity: ${showSheen ? "var(--shiny-sheen-opacity, 0.6)" : 0};
        }
        .${scope} > .shiny-button-content {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: inherit;
        }
        .${scope} > .shiny-button-content::before {
            width: calc(100% + 1rem);
            height: calc(100% + 1rem);
            box-shadow: inset 0 -1ex 2rem 4px var(--gleam-accent);
            opacity: 0;
            z-index: -1;
            transition: opacity var(--ease);
            animation: calc(var(--duration) * 1.5) breathe-${instanceId} linear infinite;
        }
        .${scope}, .${scope}::before, .${scope}::after {
            animation:
                var(--animation) var(--duration),
                var(--animation) calc(var(--duration) / 0.4) reverse paused;
            animation-composition: add;
        }
        .${scope}:focus-visible {
            --gradient-percent-${instanceId}: 20%;
            --gradient-angle-offset-${instanceId}: 95deg;
            --gradient-shine-${instanceId}: var(--gleam-accent-soft);
        }
        .${scope}:focus-visible > .shiny-button-content::before { opacity: 1; }
        @media (hover: hover) and (pointer: fine) {
            .${scope}:hover {
                --gradient-percent-${instanceId}: 20%;
                --gradient-angle-offset-${instanceId}: 95deg;
                --gradient-shine-${instanceId}: var(--gleam-accent-soft);
            }
            .${scope}:hover > .shiny-button-content::before { opacity: 1; }
        }
        @keyframes gradient-angle-${instanceId} { to { --gradient-angle-${instanceId}: 360deg; } }
        @keyframes shimmer-${instanceId} { to { rotate: 360deg; } }
        @keyframes breathe-${instanceId} { from, to { scale: 1; } 50% { scale: 1.2; } }
        @media (prefers-reduced-motion: reduce) {
            .${scope}, .${scope}::before, .${scope}::after, .${scope} > .shiny-button-content::before {
                animation: none !important;
                transition: none !important;
            }
            .${scope}::after, .${scope} > .shiny-button-content::before { opacity: 0 !important; }
            .${scope}:active { translate: none; }
        }
    `;

    return (
        <>
            <style>{css}</style>
            <Component
                {...props}
                type={asChild ? undefined : (props.type ?? "button")}
                className={cn(scope, className)}
                aria-label={props["aria-label"] ?? (asChild ? undefined : label)}
                data-reduced-motion={reducedMotion ? "true" : undefined}
            >
                {asChild ? children : <span className="shiny-button-content">{children ?? label}</span>}
            </Component>
        </>
    );
}

export default ShinyButton;
