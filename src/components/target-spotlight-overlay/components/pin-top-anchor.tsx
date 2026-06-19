"use client";

import {
    PIN_TOP_RING_SIZE_PX,
    PIN_TOP_STATUS_RING_SIZE_PX,
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID,
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_OFFSET_PX,
} from "../constants";
import { useTargetSpotlightOverlayPinTopStatus } from "../store";

export function PinTopAnchor() {
    const pinTopStatus = useTargetSpotlightOverlayPinTopStatus();
    const ringSizePx = pinTopStatus != null ? PIN_TOP_STATUS_RING_SIZE_PX : PIN_TOP_RING_SIZE_PX;
    const top = TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_OFFSET_PX - ringSizePx / 2;
    const left = `calc(50vw - ${ringSizePx / 2}px)`;

    return (
        <div
            id={TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID}
            aria-hidden
            className="pointer-events-none fixed opacity-0"
            style={{
                top,
                left,
                width: ringSizePx,
                height: ringSizePx,
            }}
        />
    );
}
