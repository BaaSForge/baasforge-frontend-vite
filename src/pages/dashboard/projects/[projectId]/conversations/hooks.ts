import { useCallback, useLayoutEffect, useRef } from "react";

export function useCaptureDocumentScroll<T>(dep: T) {
  const prevHeightRef = useRef(0);

  const capture = useCallback(() => {
    const el = document.documentElement;
    prevHeightRef.current = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    const el = document.documentElement;
    const diff = el.scrollHeight - prevHeightRef.current;
    if (diff > 0) {
      el.scrollTop += diff;
    }
  }, [dep]);

  return capture;
}
