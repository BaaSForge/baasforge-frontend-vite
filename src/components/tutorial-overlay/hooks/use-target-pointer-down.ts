import { useEffect } from "react";

export function useTargetPointerDown(
    target: HTMLElement | null,
    enabled: boolean,
    onTargetPointerDown?: (event: PointerEvent) => void,
): void {
    useEffect(() => {
        if (!enabled || target == null || onTargetPointerDown == null) return;

        const handler = (event: PointerEvent) => {
            onTargetPointerDown(event);
        };

        target.addEventListener("pointerdown", handler, true);
        return () => target.removeEventListener("pointerdown", handler, true);
    }, [enabled, onTargetPointerDown, target]);
}
