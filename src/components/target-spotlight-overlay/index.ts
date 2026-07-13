export {
    targetSpotlightOverlayStore,
    setTargetSpotlightOverlayElementId,
    setTargetSpotlightOverlayElementSelector,
    setTargetSpotlightOverlayPlacement,
    pinToTop,
    elevateTargetSpotlightZIndex,
    resetTargetSpotlightZIndex,
    isTargetSpotlightOverlayActive,
    useTargetSpotlightOverlayActive,
    useTargetSpotlightOverlayHidePinTopCircles,
    useTargetSpotlightOverlayPinTopStatus,
    useTargetSpotlightOverlayTargetElementId,
    useTargetSpotlightOverlayTargetElementSelector,
    useTargetSpotlightOverlayPlacement,
    useTargetSpotlightOverlayZIndex,
} from "./store";
export {
    SpotlightActions,
    SpotlightPrevButton,
    SpotlightPrimaryActionButton,
    SpotlightSecondaryActionButton,
    SpotlightStopButton,
} from "./components/spotlight-actions";
export { SpotlightContent } from "./components/spotlight-content";
export { TargetSpotlightOverlay } from "./target-spotlight-overlay";
export { TargetSpotlightOverlayGlobalHost } from "./target-spotlight-overlay-global-host";
export type { TargetSpotlightOverlayPlacement, CutoutRect, BackdropPanel, PinTopStatus, PinToTopOptions } from "./types";
