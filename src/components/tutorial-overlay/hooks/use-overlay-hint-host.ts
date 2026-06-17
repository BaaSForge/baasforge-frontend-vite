import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { OverlayHintController } from "../lib/overlay-hint-controller";

type UseOverlayHintHostOptions = {
    delayMs: number;
};

export function useOverlayHintHost(controller: OverlayHintController, options: UseOverlayHintHostOptions) {
    const [open, setOpen] = useState(false);
    const delayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const onOpenChange = useCallback(
        (next: boolean) => {
            if (next) {
                setOpen(true);
                return;
            }
            setOpen(false);
            controller.dismiss();
        },
        [controller],
    );

    useLayoutEffect(() => {
        const scheduleShow = () => {
            if (delayTimerRef.current != null) {
                globalThis.clearTimeout(delayTimerRef.current);
            }
            delayTimerRef.current = globalThis.setTimeout(() => {
                delayTimerRef.current = undefined;
                setOpen(true);
            }, options.delayMs);
        };

        const unsubscribe = controller.subscribe(scheduleShow);
        return () => {
            unsubscribe();
            if (delayTimerRef.current != null) {
                globalThis.clearTimeout(delayTimerRef.current);
                delayTimerRef.current = undefined;
            }
            if (!controller.isDismissed()) {
                controller.releaseShowRequest();
            }
        };
    }, [controller, options.delayMs]);

    return { open, onOpenChange };
}
