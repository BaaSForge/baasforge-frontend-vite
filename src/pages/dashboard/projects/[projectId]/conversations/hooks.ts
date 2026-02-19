import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Returns the element that actually scrolls. Use this for reading/writing scroll
 * so behavior is correct when the scroll root differs by viewport (e.g. at <768px).
 */
function getScrollRoot(): Element {
  return document.scrollingElement ?? document.documentElement;
}

type ScrollSnapshot = { scrollTop: number; scrollHeight: number };

export function useCaptureDocumentScroll<T>(dep: T) {
  const snapshotRef = useRef<ScrollSnapshot | null>(null);

  /**
   * Call this *before* loading more content (e.g. before fetchPreviousPage()).
   * Stores the current scroll position and height so we can restore after the
   * new content is in the DOM.
   */
  const capture = useCallback(() => {
    const el = getScrollRoot();
    snapshotRef.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    };
  }, []);

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    if (snapshot == null) return;

    const el = getScrollRoot();
    const newHeight = el.scrollHeight;
    const heightDelta = newHeight - snapshot.scrollHeight;
    if (heightDelta <= 0) return;

    // Defer scroll to the next frame so layout has settled (avoids fighting
    // reflow at breakpoints like 767px when the sidebar hides/shows).
    const rafId = requestAnimationFrame(() => {
      const root = getScrollRoot();
      const targetTop = snapshot.scrollTop + heightDelta;
      const maxScrollTop = root.scrollHeight - root.clientHeight;
      root.scrollTop = Math.min(targetTop, maxScrollTop);
    });
    snapshotRef.current = null;
    return () => cancelAnimationFrame(rafId);
  }, [dep]);

  return capture;
}
