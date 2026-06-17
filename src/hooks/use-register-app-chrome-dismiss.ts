import { registerAppChromeDismissHandler } from "@/lib/app-chrome-dismiss";
import { useLayoutEffect } from "react";

export function useRegisterAppChromeDismiss(dismiss: () => void): void {
    useLayoutEffect(() => registerAppChromeDismissHandler(dismiss), [dismiss]);
}

export function useRegisterAppChromeDismissWhenOpen(open: boolean, dismiss: () => void): void {
    useLayoutEffect(() => {
        if (!open) return;
        return registerAppChromeDismissHandler(dismiss);
    }, [open, dismiss]);
}
