import { createStore, useStore } from "zustand";
import type { TargetSpotlightOverlayPlacement } from "./types";

type TargetSpotlightOverlayState = {
    targetElementId: string | null;
    placement: TargetSpotlightOverlayPlacement;
    setTargetElementId: (elementId: string | null) => void;
    setPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
};

export const targetSpotlightOverlayStore = createStore<TargetSpotlightOverlayState>((set) => ({
    targetElementId: null,
    placement: "bottom",
    setTargetElementId: (elementId) => set({ targetElementId: elementId }),
    setPlacement: (placement) => set({ placement }),
}));

export function setTargetSpotlightOverlayElementId(elementId: string | null): void {
    targetSpotlightOverlayStore.getState().setTargetElementId(elementId);
}

export function setTargetSpotlightOverlayPlacement(placement: TargetSpotlightOverlayPlacement): void {
    targetSpotlightOverlayStore.getState().setPlacement(placement);
}

export function useTargetSpotlightOverlayTargetElementId(): string | null {
    return useStore(targetSpotlightOverlayStore, (s) => s.targetElementId);
}

export function useTargetSpotlightOverlayPlacement(): TargetSpotlightOverlayPlacement {
    return useStore(targetSpotlightOverlayStore, (s) => s.placement);
}
