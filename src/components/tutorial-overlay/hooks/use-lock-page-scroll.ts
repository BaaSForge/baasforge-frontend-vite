import { useEffect } from "react";
import { TUTORIAL_OVERLAY_SLOT } from "../constants";

let lockDepth = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

function isInsideTutorialOverlay(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    const root = document.querySelector(`[data-slot="${TUTORIAL_OVERLAY_SLOT}"]`);
    return root?.contains(target) ?? false;
}

export function useLockPageScroll(enabled: boolean): void {
    useEffect(() => {
        if (!enabled) return;

        lockDepth += 1;
        if (lockDepth === 1) {
            savedHtmlOverflow = document.documentElement.style.overflow;
            savedBodyOverflow = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }

        const preventBackgroundScroll = (event: Event) => {
            if (isInsideTutorialOverlay(event.target)) return;
            event.preventDefault();
        };

        const preventBackgroundScrollKeys = (event: KeyboardEvent) => {
            if (!SCROLL_KEYS.has(event.key)) return;
            if (isInsideTutorialOverlay(event.target)) return;
            event.preventDefault();
        };

        document.addEventListener("wheel", preventBackgroundScroll, { passive: false, capture: true });
        document.addEventListener("touchmove", preventBackgroundScroll, { passive: false, capture: true });
        document.addEventListener("keydown", preventBackgroundScrollKeys, { capture: true });

        return () => {
            document.removeEventListener("wheel", preventBackgroundScroll, { capture: true });
            document.removeEventListener("touchmove", preventBackgroundScroll, { capture: true });
            document.removeEventListener("keydown", preventBackgroundScrollKeys, { capture: true });

            lockDepth = Math.max(0, lockDepth - 1);
            if (lockDepth === 0) {
                document.documentElement.style.overflow = savedHtmlOverflow;
                document.body.style.overflow = savedBodyOverflow;
            }
        };
    }, [enabled]);
}
