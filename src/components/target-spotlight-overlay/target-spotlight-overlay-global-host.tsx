"use client";

import { createPortal } from "react-dom";
import { PinTopAnchor } from "./components/pin-top-anchor";
import { TargetSpotlightOverlay } from "./target-spotlight-overlay";
import { useTargetSpotlightOverlayPlacement, useTargetSpotlightOverlayTargetElementId } from "./store";

export function TargetSpotlightOverlayGlobalHost() {
    const targetElementId = useTargetSpotlightOverlayTargetElementId();
    const placement = useTargetSpotlightOverlayPlacement();

    return (
        <>
            {typeof document !== "undefined" ? createPortal(<PinTopAnchor />, document.body) : null}
            {targetElementId != null ? (
                <TargetSpotlightOverlay targetElementId={targetElementId} placement={placement} />
            ) : null}
        </>
    );
}
