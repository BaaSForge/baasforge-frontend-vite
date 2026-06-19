import { createStore, useStore } from "zustand";
import {
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID,
} from "./constants";
import type { TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayState = {
    targetElementId: string | null;
    placement: TargetSpotlightOverlayPlacement;
    setTargetElementId: (elementId: string | null) => void;
    setPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
    pinToTop: () => void;
};

export const targetSpotlightOverlayStore = createStore<TargetSpotlightOverlayState>((set, get) => ({
    targetElementId: null,
    placement: "bottom",
    setTargetElementId: (elementId) => set({ targetElementId: elementId }),
    setPlacement: (placement) => set({ placement }),
    pinToTop: () => {
        set({ targetElementId: null });
        get().setPlacement("bottom");
        get().setTargetElementId(TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID);
    },
}));

export function setTargetSpotlightOverlayElementId(elementId: string | null): void {
    targetSpotlightOverlayStore.getState().setTargetElementId(elementId);
}

export function setTargetSpotlightOverlayPlacement(placement: TargetSpotlightOverlayPlacement): void {
    targetSpotlightOverlayStore.getState().setPlacement(placement);
}

export function pinToTop(): void {
    targetSpotlightOverlayStore.getState().pinToTop();
}

export function useTargetSpotlightOverlayTargetElementId(): string | null {
    return useStore(targetSpotlightOverlayStore, (s) => s.targetElementId);
}

export function useTargetSpotlightOverlayPlacement(): TargetSpotlightOverlayPlacement {
    return useStore(targetSpotlightOverlayStore, (s) => s.placement);
}
