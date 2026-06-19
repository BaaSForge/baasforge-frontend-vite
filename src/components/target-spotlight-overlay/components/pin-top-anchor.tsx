"use client";

import {
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID,
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_OFFSET_PX,
} from "../constants";

export function PinTopAnchor() {
    return (
        <div
            id={TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID}
            aria-hidden
            className="pointer-events-none fixed size-0 opacity-0"
            style={{
                top: TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_OFFSET_PX,
                left: "50%",
                transform: "translateX(-50%)",
            }}
        />
    );
}
