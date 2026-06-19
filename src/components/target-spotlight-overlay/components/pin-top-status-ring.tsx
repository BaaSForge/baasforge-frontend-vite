import { StatusPulseRingLayer } from "@/components/status-pulse-ring";
import { cn } from "@/lib/utils";
import { PIN_TOP_STATUS_RING_SIZE_PX } from "../constants";
import { getPinTopStatusConfig } from "../lib/pin-top-status";
import type { CutoutRect, PinTopStatus } from "../types";

const PIN_TOP_STATUS_ICON_SIZE_PX = Math.round(0.875 * 16 * 1.3);

type PinTopStatusRingProps = {
    cutout: CutoutRect;
    status: PinTopStatus;
};

export function PinTopStatusRing({ cutout, status }: PinTopStatusRingProps) {
    const config = getPinTopStatusConfig(status);
    const Icon = config.Icon;
    const left = cutout.left + (cutout.right - cutout.left - PIN_TOP_STATUS_RING_SIZE_PX) / 2;
    const top = cutout.top + (cutout.bottom - cutout.top - PIN_TOP_STATUS_RING_SIZE_PX) / 2;

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed size-8 animate-in fade-in-0 duration-300"
            style={{ top, left }}
        >
            <div className="relative size-full overflow-visible rounded-full">
                <StatusPulseRingLayer className={cn("rounded-full opacity-70", config.pulseClass)} />
                <div className={cn("absolute inset-0 rounded-full", config.bgClass)}>
                    <span
                        className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white"
                        style={{
                            width: PIN_TOP_STATUS_ICON_SIZE_PX,
                            height: PIN_TOP_STATUS_ICON_SIZE_PX,
                        }}
                    >
                        <Icon className="size-full" strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </div>
    );
}
