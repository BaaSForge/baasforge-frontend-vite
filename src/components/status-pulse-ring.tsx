import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/** Keyframes: `status-pulse-ring` and `status-pulse-ring-fixed` in `global.css`. */
export const STATUS_PULSE_RING_EXPAND_REM = 1.5;

const statusPulseRingLayerScaleClass =
    "pointer-events-none absolute inset-0 origin-center bg-status-pulse-ring animate-[status-pulse-ring_1.2s_ease-out_infinite]";

const statusPulseRingLayerFixedClass =
    "pointer-events-none absolute inset-0 bg-status-pulse-ring animate-[status-pulse-ring-fixed_1.2s_ease-out_infinite]";

export type StatusPulseRingExpandMode = "scale" | "fixed";

export type StatusPulseRingLayerProps = {
    className?: string;
    style?: CSSProperties;
    expand?: StatusPulseRingExpandMode;
};

export function StatusPulseRingLayer({ className, style, expand = "scale" }: StatusPulseRingLayerProps) {
    return (
        <span
            aria-hidden
            className={cn(expand === "fixed" ? statusPulseRingLayerFixedClass : statusPulseRingLayerScaleClass, className)}
            style={style}
        />
    );
}
