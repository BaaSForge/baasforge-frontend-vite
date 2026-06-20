import { suspendUnifiedKeyboard } from "@/lib/unified-keyboard";
import { useLayoutEffect } from "react";

export function useSpotlightKeyboardSuspend(active: boolean): void {
    useLayoutEffect(() => {
        if (!active) return;
        return suspendUnifiedKeyboard();
    }, [active]);
}
