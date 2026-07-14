import { useEffect, useRef } from "react";
import { useAsyncEffect } from "./use-async-effect";

type DebouncedEffectCallback = () =>
    | void
    | (() => void)
    | Promise<void | (() => void)>;

export function useDebouncedEffect(
    effect: DebouncedEffectCallback,
    deps: React.DependencyList,
    delay: number,
) {
    const effectRef = useRef(effect);

    useEffect(() => {
        effectRef.current = effect;
    });

    useAsyncEffect(async (signal) => { // eslint-disable-line react-hooks/exhaustive-deps
        await new Promise<void>((resolve) => {
            const timeoutId = window.setTimeout(resolve, delay);

            signal.addEventListener("abort", () => {
                clearTimeout(timeoutId);
                resolve();
            });
        });

        if (signal.aborted) {
            return;
        }

        return effectRef.current();
    }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
}
