import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/** Keyframes: `status-pulse-ring` in `global.css`. Shared by LiveBadge and confirmable controls. */
export const statusPulseRingLayerBaseClass =
    "pointer-events-none absolute inset-0 origin-center bg-blue-500 animate-[status-pulse-ring_1.2s_ease-out_infinite]";

export type StatusPulseRingLayerProps = {
    className?: string;
    style?: CSSProperties;
};

export function StatusPulseRingLayer({ className, style }: StatusPulseRingLayerProps) {
    return <span aria-hidden className={cn(statusPulseRingLayerBaseClass, className)} style={style} />;
}
