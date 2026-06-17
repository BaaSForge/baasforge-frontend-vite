import {
    arrow,
    autoUpdate,
    flip,
    offset,
    shift,
    useFloating,
    type Placement,
} from "@floating-ui/react-dom";
import { useRef } from "react";
import type { TutorialOverlayPlacement } from "../types";

const ARROW_STATIC_SIDE: Record<TutorialOverlayPlacement, string> = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
};

export function useAnchoredFloating(reference: HTMLElement | null, placement: TutorialOverlayPlacement, enabled: boolean) {
    const arrowRef = useRef<HTMLDivElement>(null);

    const { refs, floatingStyles, middlewareData, placement: resolvedPlacement } = useFloating({
        elements: { reference: reference ?? undefined },
        placement: placement as Placement,
        // Floating UI reads arrowRef when positioning updates, not during React render.
        // eslint-disable-next-line react-hooks/refs -- floating-ui arrow middleware
        middleware: [offset(14), flip(), shift({ padding: 16 }), arrow({ element: arrowRef, padding: 8 })],
        whileElementsMounted: enabled ? autoUpdate : undefined,
    });

    const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
    const side = (resolvedPlacement.split("-")[0] ?? placement) as TutorialOverlayPlacement;

    return {
        arrowRef,
        setFloatingRef: refs.setFloating,
        floatingStyles,
        resolvedPlacement: side,
        arrowStyle: {
            left: arrowX != null ? `${arrowX}px` : undefined,
            top: arrowY != null ? `${arrowY}px` : undefined,
            [ARROW_STATIC_SIDE[side]]: "-5px",
        },
    };
}
