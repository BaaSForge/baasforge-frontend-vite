"use client";

import { createPortal } from "react-dom";
import { AnchoredContentBox } from "./components/anchored-content-box";
import { CutoutBackdrop } from "./components/cutout-backdrop";
import { TargetSpotlightRing } from "./components/target-spotlight-ring";
import { DEFAULT_TARGET_RING_PADDING_PX, TARGET_SPOTLIGHT_OVERLAY_Z_INDEX } from "./constants";
import { useAnchoredFloating } from "./hooks/use-anchored-floating";
import { useElementById } from "./hooks/use-element-by-id";
import { useElevatedElement } from "./hooks/use-elevated-element";
import { useTrackedRect } from "./hooks/use-tracked-rect";
import { useViewportSize } from "./hooks/use-viewport-size";
import { getBackdropPanels, getCutoutRect } from "./lib/cutout-backdrop";
import type { TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayProps = {
    targetElementId: string;
    placement?: TargetSpotlightOverlayPlacement;
    targetRingPaddingPx?: number;
};

export function TargetSpotlightOverlay({
    targetElementId,
    placement = "bottom",
    targetRingPaddingPx = DEFAULT_TARGET_RING_PADDING_PX,
}: TargetSpotlightOverlayProps) {
    const enabled = targetElementId.length > 0;
    const target = useElementById(targetElementId, enabled);
    const targetRect = useTrackedRect(target, enabled);
    const viewport = useViewportSize(enabled);

    useElevatedElement(target, enabled);

    const { arrowRef, setFloatingRef, floatingStyles, resolvedPlacement, arrowStyle } = useAnchoredFloating(
        target,
        placement,
        enabled,
    );

    if (!enabled || target == null || typeof document === "undefined") return null;

    const cutout = targetRect != null ? getCutoutRect(targetRect, targetRingPaddingPx, viewport) : null;
    const backdropPanels = cutout != null ? getBackdropPanels(cutout, viewport) : [];

    return createPortal(
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{ zIndex: TARGET_SPOTLIGHT_OVERLAY_Z_INDEX }}
        >
            <CutoutBackdrop panels={backdropPanels} />
            {cutout != null ? <TargetSpotlightRing cutout={cutout} /> : null}
            <AnchoredContentBox
                setFloatingRef={setFloatingRef}
                floatingStyles={floatingStyles}
                resolvedPlacement={resolvedPlacement}
                arrowRef={arrowRef}
                arrowStyle={arrowStyle}
            />
        </div>,
        document.body,
    );
}
