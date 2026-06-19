import { StatusPulseRingLayer } from "@/components/status-pulse-ring";
import type { CutoutRect } from "../types";

type TargetSpotlightRingProps = {
    cutout: CutoutRect;
};

export function TargetSpotlightRing({ cutout }: TargetSpotlightRingProps) {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed animate-in fade-in-0 duration-300"
            style={{
                top: cutout.top,
                left: cutout.left,
                width: cutout.right - cutout.left,
                height: cutout.bottom - cutout.top,
            }}
        >
            <div className="relative size-full overflow-visible rounded-lg">
                <StatusPulseRingLayer className="rounded-lg opacity-70" />
                <div className="absolute inset-0 rounded-lg border border-blue-500/45" />
            </div>
        </div>
    );
}
