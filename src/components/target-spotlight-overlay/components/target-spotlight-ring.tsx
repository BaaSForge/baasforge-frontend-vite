import { StatusPulseRingLayer } from "@/components/status-pulse-ring";
import {
    PIN_TOP_RING_INNER_SIZE_PX,
    PIN_TOP_RING_MIDDLE_SIZE_PX,
    PIN_TOP_RING_SIZE_PX,
    PIN_TOP_RING_SOLID_BORDER_PX,
    PIN_TOP_RING_TRANSPARENT_BORDER_PX,
} from "../constants";
import type { CutoutRect } from "../types";

type TargetSpotlightRingProps = {
    cutout: CutoutRect;
    variant?: "default" | "pin-top";
};

export function TargetSpotlightRing({ cutout, variant = "default" }: TargetSpotlightRingProps) {
    if (variant === "pin-top") {
        const left = cutout.left + (cutout.right - cutout.left - PIN_TOP_RING_SIZE_PX) / 2;
        const top = cutout.top + (cutout.bottom - cutout.top - PIN_TOP_RING_SIZE_PX) / 2;
        const middleOffset = (PIN_TOP_RING_SIZE_PX - PIN_TOP_RING_MIDDLE_SIZE_PX) / 2;
        const innerOffset = (PIN_TOP_RING_SIZE_PX - PIN_TOP_RING_INNER_SIZE_PX) / 2;

        return (
            <div
                aria-hidden
                className="pointer-events-none fixed animate-in fade-in-0 duration-300"
                style={{
                    top,
                    left,
                    width: PIN_TOP_RING_SIZE_PX,
                    height: PIN_TOP_RING_SIZE_PX,
                }}
            >
                <div className="relative size-full overflow-visible rounded-full">
                    <StatusPulseRingLayer className="rounded-full opacity-70" />
                    <div
                        className="absolute inset-0 box-border rounded-full border border-status-pulse-ring"
                        style={{ borderWidth: PIN_TOP_RING_SOLID_BORDER_PX }}
                    />
                    <div
                        className="absolute box-border rounded-full border border-transparent"
                        style={{
                            top: middleOffset,
                            left: middleOffset,
                            width: PIN_TOP_RING_MIDDLE_SIZE_PX,
                            height: PIN_TOP_RING_MIDDLE_SIZE_PX,
                            borderWidth: PIN_TOP_RING_TRANSPARENT_BORDER_PX,
                        }}
                    />
                    <div
                        className="absolute rounded-full bg-status-pulse-ring"
                        style={{
                            top: innerOffset,
                            left: innerOffset,
                            width: PIN_TOP_RING_INNER_SIZE_PX,
                            height: PIN_TOP_RING_INNER_SIZE_PX,
                        }}
                    />
                </div>
            </div>
        );
    }

    const width = cutout.right - cutout.left;
    const height = cutout.bottom - cutout.top;

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed animate-in fade-in-0 duration-300"
            style={{
                top: cutout.top,
                left: cutout.left,
                width,
                height,
            }}
        >
            <div className="relative size-full overflow-visible rounded-lg">
                <StatusPulseRingLayer expand="fixed" className="rounded-lg opacity-70" />
                <div className="absolute inset-0 rounded-lg border border-status-pulse-ring/50" />
            </div>
        </div>
    );
}
