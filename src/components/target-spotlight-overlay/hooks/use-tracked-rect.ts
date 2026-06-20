import { useLayoutEffect, useState } from "react";
import { scheduleLayoutUpdates } from "../lib/schedule-layout-updates";

export function useTrackedRect(element: HTMLElement | null, enabled: boolean): DOMRect | null {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        if (!enabled || element == null) return;

        const update = () => setRect(element.getBoundingClientRect());
        update();
        return scheduleLayoutUpdates(element, document.documentElement, update);
    }, [enabled, element]);

    return enabled && element != null ? rect : null;
}
