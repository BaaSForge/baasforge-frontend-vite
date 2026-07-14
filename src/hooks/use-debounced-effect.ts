import { useEffect, useRef } from "react";

type DebouncedEffectCallback = () =>
    | void
    | (() => void)
    | Promise<void | (() => void)>;

function isPromise<T>(value: unknown): value is Promise<T> {
    return typeof value === "object" && value !== null && "then" in value;
}

export function useDebouncedEffect(
    effect: DebouncedEffectCallback,
    deps: React.DependencyList,
    delay: number,
) {
    const effectRef = useRef(effect);
    const cleanupRef = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        effectRef.current = effect;
    });

    useEffect(() => {
        let cancelled = false;

        const timeoutId = setTimeout(() => {
            void (async () => {
                const result = effectRef.current();

                if (!isPromise<void | (() => void)>(result)) {
                    if (!cancelled) {
                        cleanupRef.current = typeof result === "function" ? result : undefined;
                    }
                    return;
                }

                const resolved = await result;

                if (!cancelled) {
                    cleanupRef.current = typeof resolved === "function" ? resolved : undefined;
                }
            })();
        }, delay);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
            cleanupRef.current?.();
            cleanupRef.current = undefined;
        };
    }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
}
