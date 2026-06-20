export const TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE = "data-target-spotlight-overlay";

type OutsideEvent = {
    target: EventTarget | null;
    preventDefault: () => void;
};

export function isTargetSpotlightOverlayEventTarget(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest(`[${TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE}]`) != null;
}

export function preventDismissIfTargetSpotlightOverlayOutsideEvent(event: OutsideEvent): void {
    if (isTargetSpotlightOverlayEventTarget(event.target)) {
        event.preventDefault();
    }
}
