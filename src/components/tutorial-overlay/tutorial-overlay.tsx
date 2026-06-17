"use client";

import { dismissAppChrome } from "@/lib/app-chrome-dismiss";
import { useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { AnchoredTipCard } from "./components/anchored-tip-card";
import { CutoutBackdrop } from "./components/cutout-backdrop";
import { OverlayFocusLock } from "./components/overlay-focus-lock";
import { TargetSpotlightRing } from "./components/target-spotlight-ring";
import {
    DEFAULT_SCROLL_TO_TOP_PX,
    DEFAULT_TARGET_RING_PADDING_PX,
    TUTORIAL_OVERLAY_Z_INDEX,
} from "./constants";
import { useAnchoredFloating } from "./hooks/use-anchored-floating";
import { useElementById } from "./hooks/use-element-by-id";
import { useElevatedElement } from "./hooks/use-elevated-element";
import { useTargetClick } from "./hooks/use-target-click";
import { useTargetPointerDown } from "./hooks/use-target-pointer-down";
import { useTrackedRect } from "./hooks/use-tracked-rect";
import { useViewportSize } from "./hooks/use-viewport-size";
import { getBackdropPanels, getCutoutRect } from "./lib/cutout-backdrop";
import type { TutorialOverlayPlacement } from "./types";

export type TutorialOverlayProps = {
    targetId: string;
    placement?: TutorialOverlayPlacement;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    targetRingPaddingPx?: number;
    scrollToTopPx?: number | null;
    title?: string;
    description?: React.ReactNode;
    dismissLabel?: string;
    onTargetPointerDown?: (event: PointerEvent) => void;
    onTargetClick?: (event: MouseEvent) => void;
    children?: React.ReactNode;
    className?: string;
};

export function TutorialOverlay({
    targetId,
    placement = "bottom",
    open,
    onOpenChange,
    targetRingPaddingPx = DEFAULT_TARGET_RING_PADDING_PX,
    scrollToTopPx = DEFAULT_SCROLL_TO_TOP_PX,
    title,
    description,
    dismissLabel,
    onTargetPointerDown,
    onTargetClick,
    children,
    className,
}: TutorialOverlayProps) {
    const target = useElementById(targetId, open);
    const targetRect = useTrackedRect(target, open);
    const viewport = useViewportSize(open);

    useElevatedElement(target, open);
    useTargetPointerDown(target, open, onTargetPointerDown);
    useTargetClick(target, open, onTargetClick);

    const { arrowRef, setFloatingRef, floatingStyles, resolvedPlacement, arrowStyle } = useAnchoredFloating(
        target,
        placement,
        open,
    );

    useLayoutEffect(() => {
        if (!open) return;
        dismissAppChrome();
    }, [open]);

    useEffect(() => {
        if (!open || target == null || scrollToTopPx == null) return;
        globalThis.window?.scrollTo({ top: scrollToTopPx });
    }, [open, scrollToTopPx, target]);

    if (!open || target == null || typeof document === "undefined") return null;

    const dismiss = () => onOpenChange?.(false);
    const cutout = targetRect != null ? getCutoutRect(targetRect, targetRingPaddingPx, viewport) : null;
    const backdropPanels = cutout != null ? getBackdropPanels(cutout, viewport) : [];

    return createPortal(
        <OverlayFocusLock
            active
            className="pointer-events-none fixed inset-0"
            style={{ zIndex: TUTORIAL_OVERLAY_Z_INDEX }}
            aria-label={title ?? "Tutorial"}
        >
            <CutoutBackdrop panels={backdropPanels} />
            {cutout != null ? <TargetSpotlightRing cutout={cutout} /> : null}
            <AnchoredTipCard
                setFloatingRef={setFloatingRef}
                floatingStyles={floatingStyles}
                resolvedPlacement={resolvedPlacement}
                arrowRef={arrowRef}
                arrowStyle={arrowStyle}
                title={title}
                description={description}
                dismissLabel={dismissLabel}
                onDismiss={dismiss}
                className={className}
            >
                {children}
            </AnchoredTipCard>
        </OverlayFocusLock>,
        document.body,
    );
}
