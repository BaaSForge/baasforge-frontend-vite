"use client";

import { createPortal } from "react-dom";
import { PinTopAnchor } from "./components/pin-top-anchor";
import { TargetSpotlightOverlay } from "./target-spotlight-overlay";
import { useSpotlightKeyboardSuspend } from "./hooks/use-spotlight-keyboard-suspend";
import {
    useTargetSpotlightOverlayActive,
    useTargetSpotlightOverlayPlacement,
    useTargetSpotlightOverlayTargetElementId,
    useTargetSpotlightOverlayTargetElementSelector,
} from "./store";

/**
 * Modal caution: if a modal opens while the spotlight is active, its backdrop covers
 * everything outside the modal panel and blocks those clicks. When backdrop dismiss is
 * disabled (`dismissOnOverlayClick={false}`), the user cannot close the modal by
 * clicking the overlay—only explicit in-modal controls work. Do not show modals with a
 * non-dismissible backdrop while a tutorial may run, or users can be stuck with no way
 * to close the modal.
 */
export function TargetSpotlightOverlayGlobalHost() {
    const active = useTargetSpotlightOverlayActive();
    const targetElementId = useTargetSpotlightOverlayTargetElementId();
    const targetElementSelector = useTargetSpotlightOverlayTargetElementSelector();
    const placement = useTargetSpotlightOverlayPlacement();

    useSpotlightKeyboardSuspend(active);

    return (
        <>
            {typeof document !== "undefined" ? createPortal(<PinTopAnchor />, document.body) : null}
            {targetElementId != null || targetElementSelector != null ? (
                <TargetSpotlightOverlay
                    targetElementId={targetElementId}
                    targetElementSelector={targetElementSelector}
                    placement={placement}
                />
            ) : null}
        </>
    );
}
