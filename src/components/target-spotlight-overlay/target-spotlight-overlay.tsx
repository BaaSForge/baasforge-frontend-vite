"use client";

import { createPortal } from "react-dom";
import { AnchoredContentBox } from "./components/anchored-content-box";
import { CutoutBackdrop } from "./components/cutout-backdrop";
import { FullScreenBackdrop } from "./components/full-screen-backdrop";
import { PinTopStatusRing } from "./components/pin-top-status-ring";
import { TargetSpotlightRing } from "./components/target-spotlight-ring";
import {
    DEFAULT_TARGET_RING_PADDING_PX,
    PIN_TOP_FLOATING_OFFSET_PX,
    TARGET_SPOTLIGHT_OVERLAY_ROOT_POINTER_EVENTS,
    isPinToTopTargetElementId,
} from "./constants";
import {
    useTargetSpotlightOverlayHidePinTopCircles,
    useTargetSpotlightOverlayPinTopStatus,
    useTargetSpotlightOverlayZIndex,
} from "./store";
import { useAnchoredFloating } from "./hooks/use-anchored-floating";
import { useElementById } from "./hooks/use-element-by-id";
import { useElementBySelector } from "./hooks/use-element-by-selector";
import { useElevatedElement } from "./hooks/use-elevated-element";
import { useTrackedRect } from "./hooks/use-tracked-rect";
import { useViewportSize } from "./hooks/use-viewport-size";
import { getBackdropPanels, getCutoutRect } from "./lib/cutout-backdrop";
import { TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE } from "./lib/outside-event";
import type { TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayProps = {
    targetElementId?: string | null;
    targetElementSelector?: string | null;
    placement?: TargetSpotlightOverlayPlacement;
    targetRingPaddingPx?: number;
};

export function TargetSpotlightOverlay({
    targetElementId = null,
    targetElementSelector = null,
    placement = "bottom",
    targetRingPaddingPx = DEFAULT_TARGET_RING_PADDING_PX,
}: TargetSpotlightOverlayProps) {
    const isPinToTop = targetElementId != null && isPinToTopTargetElementId(targetElementId);
    const hidePinTopCircles = useTargetSpotlightOverlayHidePinTopCircles();
    const pinTopStatus = useTargetSpotlightOverlayPinTopStatus();
    const overlayZIndex = useTargetSpotlightOverlayZIndex();
    const enabledById = targetElementId != null && targetElementId.length > 0;
    const enabledBySelector = targetElementSelector != null && targetElementSelector.length > 0;
    const enabled = enabledById || enabledBySelector;
    const targetById = useElementById(targetElementId ?? "", enabledById);
    const targetBySelector = useElementBySelector(targetElementSelector ?? "", enabledBySelector);
    const target = targetById ?? targetBySelector;
    const targetRect = useTrackedRect(target, enabled);
    const viewport = useViewportSize(enabled);

    useElevatedElement(target, enabled && !isPinToTop, overlayZIndex);

    const { arrowRef, setFloatingRef, floatingStyles, resolvedPlacement, arrowStyle } = useAnchoredFloating(
        target,
        placement,
        enabled,
        isPinToTop ? { offsetPx: PIN_TOP_FLOATING_OFFSET_PX, withArrow: false, lockCrossAxis: true } : undefined,
    );

    if (!enabled || target == null || typeof document === "undefined") return null;

    const cutout =
        targetRect != null
            ? getCutoutRect(targetRect, isPinToTop ? 0 : targetRingPaddingPx, viewport)
            : null;
    const backdropPanels = !isPinToTop && cutout != null ? getBackdropPanels(cutout, viewport) : [];

    return createPortal(
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            {...{ [TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE]: "" }}
            style={{
                zIndex: overlayZIndex,
                pointerEvents: TARGET_SPOTLIGHT_OVERLAY_ROOT_POINTER_EVENTS,
            }}
        >
            {isPinToTop ? <FullScreenBackdrop /> : <CutoutBackdrop panels={backdropPanels} />}
            {cutout != null && !(isPinToTop && hidePinTopCircles) ? (
                isPinToTop && pinTopStatus != null ? (
                    <PinTopStatusRing cutout={cutout} status={pinTopStatus} />
                ) : (
                    <TargetSpotlightRing cutout={cutout} variant={isPinToTop ? "pin-top" : "default"} />
                )
            ) : null}
            <AnchoredContentBox
                setFloatingRef={setFloatingRef}
                floatingStyles={floatingStyles}
                resolvedPlacement={resolvedPlacement}
                arrowRef={arrowRef}
                arrowStyle={arrowStyle}
                hideArrow={isPinToTop}
            />
        </div>,
        document.body,
    );
}
