"use client";

import { PinTopAnchor } from "./components/pin-top-anchor";
import { TargetSpotlightOverlay } from "./target-spotlight-overlay";
import { useTargetSpotlightOverlayPlacement, useTargetSpotlightOverlayTargetElementId } from "./store";

export function TargetSpotlightOverlayGlobalHost() {
    const targetElementId = useTargetSpotlightOverlayTargetElementId();
    const placement = useTargetSpotlightOverlayPlacement();

    if (targetElementId == null) return null;

    return (
        <>
            <PinTopAnchor />
            {targetElementId != null ? (
                <TargetSpotlightOverlay targetElementId={targetElementId} placement={placement} />
            ) : null}
        </>
    );
}
