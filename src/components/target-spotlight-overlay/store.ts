import { createStore, useStore } from "zustand";
import {
    DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT,
    TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID,
    TARGET_SPOTLIGHT_OVERLAY_Z_INDEX_BY_LAYOUT,
} from "./constants";
import type {
    PinToTopOptions,
    PinTopStatus,
    SetTargetSpotlightOverlayOptions,
    TargetSpotlightOverlayPlacement,
    TargetSpotlightZIndexLayout,
} from "./types";

type TargetSpotlightOverlayState = {
    targetElementId: string | null;
    targetElementSelector: string | null;
    placement: TargetSpotlightOverlayPlacement;
    hidePinTopCircles: boolean;
    pinTopStatus: PinTopStatus | null;
    zIndexLayout: TargetSpotlightZIndexLayout;
    setTargetElementId: (elementId: string | null, zIndexLayout?: TargetSpotlightZIndexLayout) => void;
    setTargetElementSelector: (selector: string | null, zIndexLayout?: TargetSpotlightZIndexLayout) => void;
    setPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
    pinToTop: (options?: PinToTopOptions) => void;
    setZIndexLayout: (zIndexLayout: TargetSpotlightZIndexLayout) => void;
};

export const targetSpotlightOverlayStore = createStore<TargetSpotlightOverlayState>((set, get) => ({
    targetElementId: null,
    targetElementSelector: null,
    placement: "bottom",
    hidePinTopCircles: false,
    pinTopStatus: null,
    zIndexLayout: DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT,
    setTargetElementId: (elementId, zIndexLayout) => {
        if (elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID) {
            set({
                targetElementId: elementId,
                targetElementSelector: null,
                ...(zIndexLayout != null ? { zIndexLayout } : {}),
            });
            return;
        }

        set({
            targetElementId: elementId,
            targetElementSelector: null,
            hidePinTopCircles: false,
            pinTopStatus: null,
            zIndexLayout: elementId == null ? DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT : (zIndexLayout ?? DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT),
        });
    },
    setTargetElementSelector: (selector, zIndexLayout) => {
        set({
            targetElementSelector: selector,
            targetElementId: null,
            hidePinTopCircles: false,
            pinTopStatus: null,
            zIndexLayout: selector == null ? DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT : (zIndexLayout ?? DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT),
        });
    },
    setPlacement: (placement) => set({ placement }),
    pinToTop: (options) => {
        set({
            targetElementId: null,
            targetElementSelector: null,
            hidePinTopCircles: options?.hidePinCircles ?? false,
            pinTopStatus: options?.status ?? null,
            zIndexLayout: "toast",
        });
        get().setPlacement("bottom");
        get().setTargetElementId(TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID);
    },
    setZIndexLayout: (zIndexLayout) => set({ zIndexLayout }),
}));

export function isTargetSpotlightOverlayActive(
    state: Pick<TargetSpotlightOverlayState, "targetElementId" | "targetElementSelector" | "pinTopStatus">,
): boolean {
    return state.targetElementId != null || state.targetElementSelector != null || state.pinTopStatus != null;
}

export function setTargetSpotlightOverlayElementId(
    elementId: string | null,
    options?: SetTargetSpotlightOverlayOptions,
): void {
    const { setTargetElementId, setPlacement } = targetSpotlightOverlayStore.getState();
    if (elementId === TARGET_SPOTLIGHT_OVERLAY_PIN_TOP_ANCHOR_ID) {
        setTargetElementId(elementId, options?.zIndexLayout);
        return;
    }

    setTargetElementId(elementId, options?.zIndexLayout);
    setPlacement(options?.placement ?? "bottom");
}

export function setTargetSpotlightOverlayElementSelector(
    selector: string | null,
    options?: SetTargetSpotlightOverlayOptions,
): void {
    const { setTargetElementSelector, setPlacement } = targetSpotlightOverlayStore.getState();
    setTargetElementSelector(selector, options?.zIndexLayout);
    setPlacement(options?.placement ?? "bottom");
}

export function setTargetSpotlightOverlayPlacement(placement: TargetSpotlightOverlayPlacement): void {
    targetSpotlightOverlayStore.getState().setPlacement(placement);
}

export function pinToTop(options?: PinToTopOptions): void {
    targetSpotlightOverlayStore.getState().pinToTop(options);
}

export function elevateTargetSpotlightZIndex(): void {
    targetSpotlightOverlayStore.getState().setZIndexLayout("modal");
}

export function resetTargetSpotlightZIndex(): void {
    targetSpotlightOverlayStore.getState().setZIndexLayout(DEFAULT_TARGET_SPOTLIGHT_Z_INDEX_LAYOUT);
}

export function getTargetSpotlightOverlayZIndex(zIndexLayout: TargetSpotlightZIndexLayout): number {
    return TARGET_SPOTLIGHT_OVERLAY_Z_INDEX_BY_LAYOUT[zIndexLayout];
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

export function useTargetSpotlightOverlayZIndex(): number {
    return useStore(targetSpotlightOverlayStore, (s) => getTargetSpotlightOverlayZIndex(s.zIndexLayout));
}
