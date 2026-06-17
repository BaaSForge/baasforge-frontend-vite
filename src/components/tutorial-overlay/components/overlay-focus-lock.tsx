"use client";

import { cn } from "@/lib/utils";
import { suspendUnifiedKeyboard } from "@/lib/unified-keyboard";
import { FocusScope } from "@radix-ui/react-focus-scope";
import { useEffect } from "react";
import { TUTORIAL_OVERLAY_SLOT } from "../constants";
import { useLockPageScroll } from "../hooks/use-lock-page-scroll";

type OverlayFocusLockProps = {
    active: boolean;
    className?: string;
    style?: React.CSSProperties;
    "aria-label"?: string;
    children: React.ReactNode;
};

export function OverlayFocusLock({ active, className, style, "aria-label": ariaLabel, children }: OverlayFocusLockProps) {
    useLockPageScroll(active);

    useEffect(() => {
        if (!active) return;
        return suspendUnifiedKeyboard();
    }, [active]);

    return (
        <FocusScope
            trapped={active}
            loop
            asChild
            onUnmountAutoFocus={(event) => event.preventDefault()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel ?? "Tutorial"}
                data-slot={TUTORIAL_OVERLAY_SLOT}
                className={cn(className)}
                style={style}
            >
                {children}
            </div>
        </FocusScope>
    );
}
