"use client";

import { TargetSpotlightOverlay } from "./target-spotlight-overlay";
import { useTargetSpotlightOverlayPlacement, useTargetSpotlightOverlayTargetElementId } from "./store";

export function TargetSpotlightOverlayGlobalHost() {
    const targetElementId = useTargetSpotlightOverlayTargetElementId();
    const placement = useTargetSpotlightOverlayPlacement();

    if (targetElementId == null) return null;

    return <TargetSpotlightOverlay targetElementId={targetElementId} placement={placement} />;
}
