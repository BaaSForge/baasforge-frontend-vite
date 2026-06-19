import { useLayoutEffect } from "react";
import { TARGET_SPOTLIGHT_OVERLAY_Z_INDEX } from "../constants";

export function useElevatedElement(element: HTMLElement | null, enabled: boolean): void {
    useLayoutEffect(() => {
        if (!enabled || element == null) return;

        const previous = {
            zIndex: element.style.zIndex,
            position: element.style.position,
        };
        const computedPosition = globalThis.getComputedStyle(element).position;

        /* eslint-disable react-hooks/immutability -- intentional DOM elevation for overlay target */
        if (computedPosition === "static") {
            element.style.position = "relative";
        }
        element.style.zIndex = String(TARGET_SPOTLIGHT_OVERLAY_Z_INDEX + 1);
        /* eslint-enable react-hooks/immutability */

        return () => {
            element.style.zIndex = previous.zIndex;
            if (computedPosition === "static") {
                element.style.position = previous.position;
            }
        };
    }, [enabled, element]);
}
