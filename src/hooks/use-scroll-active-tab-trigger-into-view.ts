import { useCallback, useLayoutEffect, useRef } from "react";

export type UseScrollActiveTabTriggerIntoViewOptions = {
    enabled?: boolean;
};

export function useScrollActiveTabTriggerIntoView(
    activeValue: string,
    options?: UseScrollActiveTabTriggerIntoViewOptions,
) {
    const enabled = options?.enabled ?? true;
    const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const setTriggerRef = useCallback((value: string, node: HTMLButtonElement | null) => {
        if (node) triggerRefs.current.set(value, node);
        else triggerRefs.current.delete(value);
    }, []);

    useLayoutEffect(() => {
        if (!enabled || activeValue === "") return;
        const el = triggerRefs.current.get(activeValue);
        if (!el) return;
        let cancelled = false;
        const outer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (cancelled) return;
                el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            });
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(outer);
        };
    }, [activeValue, enabled]);

    return setTriggerRef;
}
