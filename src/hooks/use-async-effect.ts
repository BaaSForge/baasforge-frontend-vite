import { useEffect, type DependencyList } from "react";

type AsyncEffectCallback = () => Promise<void | (() => void)>;

export function useAsyncEffect(
    effect: AsyncEffectCallback,
    deps: DependencyList,
) {
    useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | undefined;

        (async () => {
            const result = await effect();

            if (cancelled) {
                if (typeof result === "function") {
                    result();
                }
                return;
            }

            if (typeof result === "function") {
                cleanup = result;
            }
        })();

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
