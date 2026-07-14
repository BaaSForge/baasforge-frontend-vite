import { useEffect, type DependencyList } from "react";

type AsyncEffectCallback = (signal: AbortSignal) => Promise<void | (() => void)>;

export function useAsyncEffect(
    effect: AsyncEffectCallback,
    deps: DependencyList,
) {
    useEffect(() => {
        const controller = new AbortController();
        let cleanup: (() => void) | undefined;

        (async () => {
            const result = await effect(controller.signal);

            if (controller.signal.aborted) {
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
            controller.abort();
            cleanup?.();
        };
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
