import { createStore, useStore } from "zustand";
import { TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID } from "./constants";
import type { PinToTopOptions, PinTopStatus, TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayState = {
    targetElementId: string | null;
    placement: TargetSpotlightOverlayPlacement;
    hidePinTopCircles: boolean;
    pinTopStatus: PinTopStatus | null;
    zIndexElevated: boolean;
    setTargetElementId: (elementId: string | null) => void;
    setPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
    pinToTop: (options?: PinToTopOptions) => void;
    elevateZIndex: () => void;
    resetZIndex: () => void;
};

export const targetSpotlightOverlayStore = createStore<TargetSpotlightOverlayState>((set, get) => ({
    targetElementId: null,
    placement: "bottom",
    hidePinTopCircles: false,
    pinTopStatus: null,
    zIndexElevated: false,
    setTargetElementId: (elementId) => {
        if (elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID) {
            set({ targetElementId: elementId });
            return;
        }

        set({ targetElementId: elementId, hidePinTopCircles: false, pinTopStatus: null });
    },
    setPlacement: (placement) => set({ placement }),
    pinToTop: (options) => {
        set({
            targetElementId: null,
            hidePinTopCircles: options?.hidePinCircles ?? false,
            pinTopStatus: options?.status ?? null,
        });
        get().setPlacement("bottom");
        get().setTargetElementId(TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID);
    },
    elevateZIndex: () => set({ zIndexElevated: true }),
    resetZIndex: () => set({ zIndexElevated: false }),
}));

export function setTargetSpotlightOverlayElementId(elementId: string | null): void {
    targetSpotlightOverlayStore.getState().setTargetElementId(elementId);
}

export function setTargetSpotlightOverlayPlacement(placement: TargetSpotlightOverlayPlacement): void {
    targetSpotlightOverlayStore.getState().setPlacement(placement);
}

export function pinToTop(options?: PinToTopOptions): void {
    targetSpotlightOverlayStore.getState().pinToTop(options);
}

export function elevateTargetSpotlightOverlayZIndex(): void {
    targetSpotlightOverlayStore.getState().elevateZIndex();
}

export function resetTargetSpotlightOverlayZIndex(): void {
    targetSpotlightOverlayStore.getState().resetZIndex();
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

export function useTargetSpotlightOverlayPlacement(): TargetSpotlightOverlayPlacement {
    return useStore(targetSpotlightOverlayStore, (s) => s.placement);
}

export function useTargetSpotlightOverlayZIndexElevated(): boolean {
    return useStore(targetSpotlightOverlayStore, (s) => s.zIndexElevated);
}
