import { autoUpdate } from "@floating-ui/react-dom";
import { useLayoutEffect, useState } from "react";

export function useTrackedRect(element: HTMLElement | null, enabled: boolean): DOMRect | null {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        if (!enabled || element == null) return;

        const update = () => setRect(element.getBoundingClientRect());
        update();
        return autoUpdate(element, document.documentElement, update);
    }, [enabled, element]);

    return enabled && element != null ? rect : null;
}
