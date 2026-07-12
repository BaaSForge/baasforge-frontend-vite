export enum ScrollBehavior {
    Smooth = "smooth",
    Instant = "instant",
}

const SCROLL_SETTLE_STABLE_FRAMES = 2;

/**
 * Runs `onSettled` after window scrolling stops.
 * Uses `scrollend` when the browser fires it, and rAF scroll-position stability otherwise.
 */
export function whenWindowScrollSettled(onSettled: () => void): () => void {
    const root = document.scrollingElement ?? document.documentElement;
    let cancelled = false;
    let settled = false;
    let rafId: number | undefined;

    const onScrollEnd = () => finish();

    const cleanup = () => {
        window.removeEventListener("scrollend", onScrollEnd);
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = undefined;
        }
    };

    const finish = () => {
        if (cancelled || settled) return;
        settled = true;
        cleanup();
        onSettled();
    };

    window.addEventListener("scrollend", onScrollEnd, { passive: true });

    let lastScrollTop = root.scrollTop;
    let stableFrames = 0;

    const tick = () => {
        if (cancelled || settled) return;

        const scrollTop = root.scrollTop;
        if (scrollTop === lastScrollTop) {
            stableFrames += 1;
            if (stableFrames >= SCROLL_SETTLE_STABLE_FRAMES) {
                finish();
                return;
            }
        } else {
            stableFrames = 0;
            lastScrollTop = scrollTop;
        }

        rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
        cancelled = true;
        cleanup();
    };
}

export function scrollWindowByWhenSettled(delta: { top?: number; left?: number }): () => void {
    return whenWindowScrollSettled(() => window.scrollBy(delta));
}

function scroll(containerId: string | undefined, getTop: (el: Element | null) => number, behavior: ScrollBehavior = ScrollBehavior.Instant) {
    const el = containerId ? document.getElementById(containerId) : null;
    const top = getTop(el);
    if (el) el.scrollTo({ top, behavior });
    else window.scrollTo({ top, behavior });
}

export function scrollToTop(containerId?: string, behavior?: ScrollBehavior) {
    scroll(containerId, () => 0, behavior);
}

export function scrollToBottom(containerId?: string, behavior?: ScrollBehavior) {
    scroll(
        containerId,
        (el) => {
            const target = el ?? document.documentElement;
            return target.scrollHeight - target.clientHeight;
        },
        behavior,
    );
}

/**
 * Smooth-scroll so the top of `element` aligns with the top of the viewport.
 * Recomputes the target each frame so DOM re-renders don't interrupt the scroll.
 * Stops after maxDurationMs so we don't keep forcing scroll when content is streaming (placeholder keeps moving).
 */
export function smoothScrollToElementTop(element: HTMLElement, maxDurationMs: number = 500): void {
    const root = document.scrollingElement ?? document.documentElement;
    const tolerancePx = 2;
    const lerpFactor = 0.12;
    const startTime = performance.now();

    const tick = () => {
        if (performance.now() - startTime >= maxDurationMs) return;

        const rect = element.getBoundingClientRect();
        const targetScrollTop = root.scrollTop + rect.top;

        if (Math.abs(rect.top) <= tolerancePx) return;

        const next = root.scrollTop + (targetScrollTop - root.scrollTop) * lerpFactor;
        root.scrollTop = next;
        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}
