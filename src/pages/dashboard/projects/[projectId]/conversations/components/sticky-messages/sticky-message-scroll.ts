import { ScrollBehavior } from "@/lib/dom";

import { STICKY_MESSAGE_GROUP_ORDER, type StickyMessageGroupId } from "./sticky-message-groups";

const DEFAULT_ROW_FALLBACK_PX = 40;

/** Extra space below sticky headers so the message is not flush against the bars. */
export const SCROLL_TO_MESSAGE_EXTRA_PADDING_PX = 16;

const STICKY_MESSAGE_BAR_SLOT = "[data-slot=\"sticky-message-bar\"]";
const PAGE_TITLE_BOX_SLOT = "[data-slot=\"page-title-box\"]";

/**
 * Bottom edge of the fixed page title bar in viewport coordinates (px from top).
 * Matches main chrome + page title; use DOM so it stays in sync with transitions and ResizeObserver.
 */
export function getPageTitleBoxBottomPxFromDom(): number {
    const el = document.querySelector<HTMLElement>(PAGE_TITLE_BOX_SLOT);
    if (el == null) return 0;
    return el.getBoundingClientRect().bottom;
}

/**
 * Total height of currently mounted sticky message bars (measured from the DOM).
 * Prefer this at scroll-to time so the offset matches what is actually on screen.
 */
export function getStickyMessageBarsTotalHeightFromDom(): number {
    const nodes = document.querySelectorAll<HTMLElement>(STICKY_MESSAGE_BAR_SLOT);
    let sum = 0;
    nodes.forEach((el) => {
        sum += el.getBoundingClientRect().height;
    });
    return sum;
}

/**
 * Viewport Y for the top of the scrolled-to message: below the page title and below every sticky message row.
 * Uses the **bottom** of the lowest sticky bar so gaps between rows are included; falls back to page title only when no bars.
 */
export function getScrollTargetTopBelowStickyHeadersFromDom(
    extraPaddingPx: number = SCROLL_TO_MESSAGE_EXTRA_PADDING_PX,
): number {
    const pageTitleBottom = getPageTitleBoxBottomPxFromDom();
    const bars = [...document.querySelectorAll<HTMLElement>(STICKY_MESSAGE_BAR_SLOT)];
    if (bars.length === 0) {
        return pageTitleBottom + extraPaddingPx;
    }
    const maxBarBottom = Math.max(...bars.map((b) => b.getBoundingClientRect().bottom));
    return Math.max(pageTitleBottom, maxBarBottom) + extraPaddingPx;
}

/**
 * Sum of heights of all visible sticky message rows (not including page title / breadcrumb).
 * `layoutBaseTopPx` is handled separately when computing the final viewport target.
 */
export function getStickyMessageRowsTotalHeightPx(
    activeByGroup: Record<StickyMessageGroupId, string | null>,
    getRowHeights: () => Readonly<Partial<Record<StickyMessageGroupId, number>>>,
): number {
    let sum = 0;
    for (const g of STICKY_MESSAGE_GROUP_ORDER) {
        if (activeByGroup[g] != null) {
            sum += getRowHeights()[g] ?? DEFAULT_ROW_FALLBACK_PX;
        }
    }
    return sum;
}

/**
 * Viewport Y (px from top) where the top edge of the scrolled-to message should sit:
 * directly below the page title + all sticky message bars + optional padding.
 */
export function getScrollTargetTopBelowStickyHeadersPx(
    layoutBaseTopPx: number,
    activeByGroup: Record<StickyMessageGroupId, string | null>,
    getRowHeights: () => Readonly<Partial<Record<StickyMessageGroupId, number>>>,
    extraPaddingPx: number = SCROLL_TO_MESSAGE_EXTRA_PADDING_PX,
): number {
    return layoutBaseTopPx + getStickyMessageRowsTotalHeightPx(activeByGroup, getRowHeights) + extraPaddingPx;
}

/**
 * Scroll the window so `element`'s top aligns with `targetTop` in the viewport (CSS px from viewport top).
 */
export function scrollWindowToAlignElementTop(element: HTMLElement, targetTop: number, behavior: ScrollBehavior = ScrollBehavior.Smooth): void {
    const root = document.scrollingElement ?? document.documentElement;
    const rect = element.getBoundingClientRect();
    const delta = rect.top - targetTop;
    const nextTop = root.scrollTop + delta;
    root.scrollTo({ top: nextTop, behavior });
}

/**
 * Same as {@link scrollWindowToAlignElementTop}, then runs `onComplete` after scroll settles
 * (`scrollend` when available, otherwise a short timeout for smooth scroll).
 */
export function scrollWindowToAlignElementTopWithCompletion(
    element: HTMLElement,
    targetTop: number,
    behavior: ScrollBehavior,
    onComplete: () => void,
): void {
    scrollWindowToAlignElementTop(element, targetTop, behavior);

    if (behavior === ScrollBehavior.Instant) {
        queueMicrotask(onComplete);
        return;
    }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        window.removeEventListener("scrollend", onScrollEnd);
        clearTimeout(fallbackTimer);
        onComplete();
    };

    const onScrollEnd = () => finish();
    window.addEventListener("scrollend", onScrollEnd, { passive: true });

    const fallbackTimer = window.setTimeout(finish, 700);
}

export { DEFAULT_ROW_FALLBACK_PX };
