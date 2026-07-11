"use client";

import { useCallback, useLayoutEffect } from "react";

import { decrementOverlayOpen, incrementOverlayOpen, type OverlayKind } from "./overlay-open-registration";

export function useOverlayOpenRegistration(
    kind: OverlayKind,
    open: boolean | undefined,
    onOpenChange?: (open: boolean) => void,
): (open: boolean) => void {
    useLayoutEffect(() => {
        if (open !== true) return;
        incrementOverlayOpen(kind);
        return () => decrementOverlayOpen(kind);
    }, [kind, open]);

    return useCallback(
        (next: boolean) => {
            if (open === undefined) {
                if (next) incrementOverlayOpen(kind);
                else decrementOverlayOpen(kind);
            }
            onOpenChange?.(next);
        },
        [kind, onOpenChange, open],
    );
}
