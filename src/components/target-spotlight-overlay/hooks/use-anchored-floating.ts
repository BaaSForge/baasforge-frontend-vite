import {
    arrow,
    flip,
    offset,
    shift,
    useFloating,
    type Placement,
} from "@floating-ui/react-dom";
import { useRef, type CSSProperties } from "react";
import { scheduleLayoutUpdates } from "../lib/schedule-layout-updates";
import type { TargetSpotlightOverlayPlacement } from "../types";

const SPOTLIGHT_CONTENT_BOX_WIDTH = "min(calc(100vw - 32px), 30rem)";

const INITIAL_UNPOSITIONED_FLOATING_STYLES: CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    transform: `translate(calc(50vw - ${SPOTLIGHT_CONTENT_BOX_WIDTH} / 2), 0px)`,
};

const ARROW_STATIC_SIDE: Record<TargetSpotlightOverlayPlacement, string> = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
};

export function useAnchoredFloating(
    reference: HTMLElement | null,
    placement: TargetSpotlightOverlayPlacement,
    enabled: boolean,
    options?: { offsetPx?: number; withArrow?: boolean; lockCrossAxis?: boolean },
) {
    const arrowRef = useRef<HTMLDivElement>(null);
    const offsetPx = options?.offsetPx ?? 14;
    const withArrow = options?.withArrow ?? true;
    const lockCrossAxis = options?.lockCrossAxis ?? false;

    /* eslint-disable react-hooks/refs -- floating-ui arrow middleware reads arrowRef during positioning */
    const middleware = [
        offset(offsetPx),
        flip(),
        shift({ padding: 16, crossAxis: !lockCrossAxis }),
        ...(withArrow ? [arrow({ element: arrowRef, padding: 8 })] : []),
    ];
    /* eslint-enable react-hooks/refs */

    const { refs, floatingStyles, middlewareData, placement: resolvedPlacement, isPositioned } = useFloating({
        elements: { reference: reference ?? undefined },
        placement: placement as Placement,
        strategy: "fixed",
        middleware,
        whileElementsMounted: enabled
            ? (reference, floating, update) => {
                  if (!(reference instanceof Element) || !(floating instanceof HTMLElement)) return () => {};
                  return scheduleLayoutUpdates(reference, floating, update);
              }
            : undefined,
    });

    const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
    const side = (resolvedPlacement.split("-")[0] ?? placement) as TargetSpotlightOverlayPlacement;

    return {
        arrowRef,
        setFloatingRef: refs.setFloating,
        floatingStyles: isPositioned ? floatingStyles : INITIAL_UNPOSITIONED_FLOATING_STYLES,
        resolvedPlacement: side,
        arrowStyle: {
            left: arrowX != null ? `${arrowX}px` : undefined,
            top: arrowY != null ? `${arrowY}px` : undefined,
            [ARROW_STATIC_SIDE[side]]: "-5px",
        },
    };
}
