import { useEffect } from "react";

export function useTargetClick(
    target: HTMLElement | null,
    enabled: boolean,
    onTargetClick?: (event: MouseEvent) => void,
): void {
    useEffect(() => {
        if (!enabled || target == null || onTargetClick == null) return;

        const handler = (event: MouseEvent) => {
            onTargetClick(event);
        };

        target.addEventListener("click", handler, true);
        return () => target.removeEventListener("click", handler, true);
    }, [enabled, onTargetClick, target]);
}
