import { createStore, useStore } from "zustand";
import { TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID } from "./constants";
import type { PinToTopOptions, PinTopStatus, TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayState = {
    targetElementId: string | null;
    targetElementSelector: string | null;
    placement: TargetSpotlightOverlayPlacement;
    hidePinTopCircles: boolean;
    pinTopStatus: PinTopStatus | null;
    setTargetElementId: (elementId: string | null) => void;
    setTargetElementSelector: (selector: string | null) => void;
    setPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
    pinToTop: (options?: PinToTopOptions) => void;
};

export const targetSpotlightOverlayStore = createStore<TargetSpotlightOverlayState>((set, get) => ({
    targetElementId: null,
    targetElementSelector: null,
    placement: "bottom",
    hidePinTopCircles: false,
    pinTopStatus: null,
    setTargetElementId: (elementId) => {
        if (elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID) {
            set({ targetElementId: elementId, targetElementSelector: null });
            return;
        }

        set({ targetElementId: elementId, targetElementSelector: null, hidePinTopCircles: false, pinTopStatus: null });
    },
    setTargetElementSelector: (selector) => {
        set({ targetElementSelector: selector, targetElementId: null, hidePinTopCircles: false, pinTopStatus: null });
    },
    setPlacement: (placement) => set({ placement }),
    pinToTop: (options) => {
        set({
            targetElementId: null,
            targetElementSelector: null,
            hidePinTopCircles: options?.hidePinCircles ?? false,
            pinTopStatus: options?.status ?? null,
        });
        get().setPlacement("bottom");
        get().setTargetElementId(TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID);
    },
}));

export function isTargetSpotlightOverlayActive(
    state: Pick<TargetSpotlightOverlayState, "targetElementId" | "targetElementSelector" | "pinTopStatus">,
): boolean {
    return state.targetElementId != null || state.targetElementSelector != null || state.pinTopStatus != null;
}

export function setTargetSpotlightOverlayElementId(
    elementId: string | null,
    options?: { placement?: TargetSpotlightOverlayPlacement },
): void {
    const { setTargetElementId, setPlacement } = targetSpotlightOverlayStore.getState();
    if (elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID) {
        setTargetElementId(elementId);
        return;
    }

    setTargetElementId(elementId);
    setPlacement(options?.placement ?? "bottom");
}

export function setTargetSpotlightOverlayElementSelector(
    selector: string | null,
    options?: { placement?: TargetSpotlightOverlayPlacement },
): void {
    const { setTargetElementSelector, setPlacement } = targetSpotlightOverlayStore.getState();
    setTargetElementSelector(selector);
    setPlacement(options?.placement ?? "bottom");
}

export function setTargetSpotlightOverlayPlacement(placement: TargetSpotlightOverlayPlacement): void {
    targetSpotlightOverlayStore.getState().setPlacement(placement);
}

export function pinToTop(options?: PinToTopOptions): void {
    targetSpotlightOverlayStore.getState().pinToTop(options);
}

export function useTargetSpotlightOverlayHidePinTopCircles(): boolean {
    return useStore(targetSpotlightOverlayStore, (s) => s.hidePinTopCircles);
}

export function useTargetSpotlightOverlayPinTopStatus(): PinTopStatus | null {
    return useStore(targetSpotlightOverlayStore, (s) => s.pinTopStatus);
}

export function useTargetSpotlightOverlayTargetElementId(): string | null {
    return useStore(targetSpotlightOverlayStore, (s) => s.targetElementId);
}

export function useTargetSpotlightOverlayTargetElementSelector(): string | null {
    return useStore(targetSpotlightOverlayStore, (s) => s.targetElementSelector);
}

export function useTargetSpotlightOverlayPlacement(): TargetSpotlightOverlayPlacement {
    return useStore(targetSpotlightOverlayStore, (s) => s.placement);
}

export function useTargetSpotlightOverlayActive(): boolean {
    return useStore(targetSpotlightOverlayStore, isTargetSpotlightOverlayActive);
}
