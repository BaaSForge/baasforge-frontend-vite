import { absorbNextClick } from "@/lib/absorb-next-click";
import { flushSync } from "react-dom";

export function dismissOverlayBeforeTargetActivate(
    onOpenChange: (open: boolean) => void,
    afterDismiss?: () => void,
): (event: PointerEvent) => void {
    return (event) => {
        if (afterDismiss != null) {
            event.preventDefault();
            event.stopPropagation();
            absorbNextClick();
        }
        flushSync(() => onOpenChange(false));
        if (afterDismiss != null) {
            queueMicrotask(() => afterDismiss());
        }
    };
}
