import { useEffect, useRef } from "react";

export function useDebouncedEffect(
    effect: React.EffectCallback,
    deps: React.DependencyList,
    delay: number,
) {
    const cleanupRef = useRef<ReturnType<React.EffectCallback>>(undefined);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cleanupRef.current = effect();
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            cleanupRef.current?.();
            cleanupRef.current = undefined;
        };
    }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
}
