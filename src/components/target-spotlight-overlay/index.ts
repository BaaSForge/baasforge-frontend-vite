export {
    targetSpotlightOverlayStore,
    setTargetSpotlightOverlayElementId,
    setTargetSpotlightOverlayPlacement,
    pinToTop,
    isTargetSpotlightOverlayActive,
    useTargetSpotlightOverlayActive,
    useTargetSpotlightOverlayHidePinTopCircles,
    useTargetSpotlightOverlayPinTopStatus,
    useTargetSpotlightOverlayTargetElementId,
    useTargetSpotlightOverlayPlacement,
} from "./store";
export {
    SpotlightActions,
    SpotlightPrimaryActionButton,
    SpotlightSecondaryActionButton,
    SpotlightStopButton,
} from "./components/spotlight-actions";
export { SpotlightContent } from "./components/spotlight-content";
export { TargetSpotlightOverlay } from "./target-spotlight-overlay";
export { TargetSpotlightOverlayGlobalHost } from "./target-spotlight-overlay-global-host";
export type { TargetSpotlightOverlayPlacement, CutoutRect, BackdropPanel, PinTopStatus, PinToTopOptions } from "./types";
