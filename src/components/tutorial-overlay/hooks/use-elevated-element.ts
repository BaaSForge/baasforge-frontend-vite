import { useLayoutEffect } from "react";
import { TUTORIAL_OVERLAY_Z_INDEX } from "../constants";

export function useElevatedElement(element: HTMLElement | null, enabled: boolean): void {
    useLayoutEffect(() => {
        if (!enabled || element == null) return;

        const previous = {
            zIndex: element.style.zIndex,
            position: element.style.position,
        };
        const computedPosition = globalThis.getComputedStyle(element).position;

        // Elevate the spotlight target above backdrop panels for the overlay session.
        /* eslint-disable react-hooks/immutability -- intentional DOM elevation for overlay target */
        if (computedPosition === "static") {
            element.style.position = "relative";
        }
        element.style.zIndex = String(TUTORIAL_OVERLAY_Z_INDEX + 1);
        /* eslint-enable react-hooks/immutability */

        return () => {
            element.style.zIndex = previous.zIndex;
            if (computedPosition === "static") {
                element.style.position = previous.position;
            }
        };
    }, [enabled, element]);
}
