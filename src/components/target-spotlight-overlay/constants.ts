/** Matches `--z-index-spotlight` in `global.css` — above modals/sidebars, below poppers. */
export const TARGET_SPOTLIGHT_OVERLAY_Z_INDEX = 51;

export const TARGET_SPOTLIGHT_OVERLAY_ROOT_POINTER_EVENTS = "none" as const;

export const TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS = "auto" as const;

export const DEFAULT_TARGET_RING_PADDING_PX = 6;

export const TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID = "target-spotlight-overlay-content";

export const TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID = "target-spotlight-overlay-actions";

export const TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID = "target-spotlight-overlay-pin-top-anchor";

export const TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_OFFSET_PX = 50;

const PIN_TOP_RING_SCALE = 0.7;

const PIN_TOP_RING_INNER_SIZE_BASE_PX = 16;
const PIN_TOP_RING_TRANSPARENT_BORDER_BASE_PX = 3;
const PIN_TOP_RING_SOLID_BORDER_BASE_PX = 2;

export const PIN_TOP_RING_INNER_SIZE_PX = Math.round(PIN_TOP_RING_INNER_SIZE_BASE_PX * PIN_TOP_RING_SCALE);
export const PIN_TOP_RING_TRANSPARENT_BORDER_PX = Math.round(PIN_TOP_RING_TRANSPARENT_BORDER_BASE_PX * PIN_TOP_RING_SCALE);
export const PIN_TOP_RING_SOLID_BORDER_PX = Math.round(PIN_TOP_RING_SOLID_BORDER_BASE_PX * PIN_TOP_RING_SCALE);
export const PIN_TOP_RING_SIZE_PX =
    PIN_TOP_RING_INNER_SIZE_PX + PIN_TOP_RING_TRANSPARENT_BORDER_PX * 2 + PIN_TOP_RING_SOLID_BORDER_PX * 2;

export const PIN_TOP_RING_MIDDLE_SIZE_PX = PIN_TOP_RING_INNER_SIZE_PX + PIN_TOP_RING_TRANSPARENT_BORDER_PX * 2;

export const PIN_TOP_FLOATING_OFFSET_PX = 16;

export const PIN_TOP_STATUS_RING_SIZE_PX = 32;

export function isPinToTopTargetElementId(elementId: string): boolean {
    return elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID;
}
