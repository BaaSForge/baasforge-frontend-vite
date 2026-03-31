"use client";

import { useCallback, useRef } from "react";

/**
 * Duration after `arm()` during which:
 * - {@link shouldSuppressFollowUpClick} stays true, and
 * - the document capture listener (if still attached) times out.
 *
 * Radix dialog/drawer opens after `setState`; until the portal is committed, the same user
 * gesture can still complete a `click` on content underneath. A later `click` can also land
 * on a *different* row. Radix does not expose a “stray click” flag, so we combine a time
 * window with a one-shot capture listener (see below).
 */
const DEFAULT_SUPPRESS_MS = 750;

/**
 * Shared deadline across every consumer on the page (e.g. all release cards in a sidebar).
 * A stray `click` from opening one overlay may hit another row; per-instance refs alone
 * cannot suppress that.
 */
let globalSuppressClickUntilMs = 0;

/** Single active “absorb” registration so rapid re-arms do not stack listeners. */
let absorbStrayDocumentClickCleanup: (() => void) | null = null;

function pathTouchesOpenModalShell(path: EventTarget[]): boolean {
    for (const n of path) {
        if (!(n instanceof Element)) continue;
        const slot = n.getAttribute("data-slot");
        if (
            slot === "dialog-overlay" ||
            slot === "dialog-content" ||
            slot === "dialog-portal" ||
            slot === "drawer-overlay" ||
            slot === "drawer-content" ||
            slot === "drawer-portal"
        ) {
            return true;
        }
        if (n.getAttribute("role") === "dialog") return true;
    }
    return false;
}

/**
 * After {@link armOverlayOpenSuppression}, the next `click` that reaches `document` in the
 * **capture** phase and does **not** intersect our modal/drawer shell is treated as
 * click-through: we stop it before bubbling handlers (e.g. a selectable row under the portal).
 *
 * Registered in a microtask so it does not run during the same `click` that invoked `arm`
 * (that event has already finished dispatch before microtasks run).
 */
function registerDocumentStrayClickAbsorber(durationMs: number) {
    absorbStrayDocumentClickCleanup?.();

    let finished = false;
    const teardown = () => {
        if (finished) return;
        finished = true;
        document.removeEventListener("click", onDocumentClickCapture, true);
        window.clearTimeout(timeoutId);
        absorbStrayDocumentClickCleanup = null;
    };

    const onDocumentClickCapture = (ev: MouseEvent) => {
        if (pathTouchesOpenModalShell(ev.composedPath())) {
            teardown();
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        teardown();
    };

    const timeoutId = window.setTimeout(teardown, durationMs);
    absorbStrayDocumentClickCleanup = teardown;

    queueMicrotask(() => {
        if (finished) return;
        document.addEventListener("click", onDocumentClickCapture, true);
    });
}

export type UseSuppressClicksAfterRadixOverlayOpenOptions = {
    /**
     * How long suppression stays active. Defaults to {@link DEFAULT_SUPPRESS_MS}.
     */
    durationMs?: number;
};

/**
 * Mitigates “click-through” after opening a Radix dialog or drawer from a control under the
 * overlay (common with controlled `open` and no `DialogTrigger`).
 *
 * **Usage**
 * 1. Prefer committing the overlay synchronously when possible, e.g. `flushSync(() => setOpen(true))`
 *    right after {@link armOverlayOpenSuppression}, so the dim layer exists before the browser
 *    finishes the gesture.
 * 2. Call {@link armOverlayOpenSuppression} immediately before that `setOpen(true)` (or immediately
 *    before a plain `setOpen` if you cannot use `flushSync`).
 * 3. In ancestor `onClick` handlers that must ignore strays (e.g. “select row”), return early when
 *    {@link shouldSuppressFollowUpClick} is true.
 * 4. Keep `stopPropagation` on nested interactive regions that should never activate the row.
 *
 * **Limits**: Not a Radix API; overlay/drawer detection uses `data-slot` / `role` from this app’s UI primitives.
 */
export function useSuppressClicksAfterRadixOverlayOpen(
    options: UseSuppressClicksAfterRadixOverlayOpenOptions = {},
): {
    armOverlayOpenSuppression: () => void;
    shouldSuppressFollowUpClick: () => boolean;
} {
    const durationMs = options.durationMs ?? DEFAULT_SUPPRESS_MS;
    const localSuppressUntilMs = useRef(0);

    const armOverlayOpenSuppression = useCallback(() => {
        if (typeof performance === "undefined") return;
        const until = performance.now() + durationMs;
        localSuppressUntilMs.current = until;
        globalSuppressClickUntilMs = until;
        registerDocumentStrayClickAbsorber(durationMs);
    }, [durationMs]);

    const shouldSuppressFollowUpClick = useCallback(() => {
        if (typeof performance === "undefined") return false;
        const now = performance.now();
        return now < localSuppressUntilMs.current || now < globalSuppressClickUntilMs;
    }, []);

    return { armOverlayOpenSuppression, shouldSuppressFollowUpClick };
}
