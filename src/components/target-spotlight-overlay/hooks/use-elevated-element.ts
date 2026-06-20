import { useLayoutEffect } from "react";

export function useElevatedElement(element: HTMLElement | null, enabled: boolean, overlayZIndex: number): void {
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
        element.style.zIndex = String(overlayZIndex + 1);
        /* eslint-enable react-hooks/immutability */

        return () => {
            element.style.zIndex = previous.zIndex;
            if (computedPosition === "static") {
                element.style.position = previous.position;
            }
        };
    }, [enabled, element, overlayZIndex]);
}
