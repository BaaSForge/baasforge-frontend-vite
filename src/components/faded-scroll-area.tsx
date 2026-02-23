import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SCROLL_END_THRESHOLD = 2;

type Orientation = "vertical" | "horizontal";

interface FadedScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  orientation?: Orientation;
  scrollToEndByDefault?: boolean;
  hideScrollbar?: boolean;
}

function getScrollFlagsVertical(el: HTMLDivElement) {
  const { scrollTop, scrollHeight, clientHeight } = el;
  const canScroll = scrollHeight > clientHeight;
  return {
    canScroll,
    showStart: canScroll && scrollTop > SCROLL_END_THRESHOLD,
    showEnd:
      canScroll && scrollTop + clientHeight < scrollHeight - SCROLL_END_THRESHOLD,
  };
}

function getScrollFlagsHorizontal(el: HTMLDivElement) {
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const canScroll = scrollWidth > clientWidth;
  return {
    canScroll,
    showStart: canScroll && scrollLeft > SCROLL_END_THRESHOLD,
    showEnd:
      canScroll && scrollLeft + clientWidth < scrollWidth - SCROLL_END_THRESHOLD,
  };
}

export function FadedScrollArea({
  children,
  className,
  style,
  orientation = "vertical",
  scrollToEndByDefault = false,
  hideScrollbar = false,
}: FadedScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const startFadeRef = React.useRef<HTMLDivElement>(null);
  const endFadeRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef({
    canScroll: false,
    showStart: false,
    showEnd: true,
  });
  const [canScroll, setCanScroll] = React.useState(false);
  const isHorizontal = orientation === "horizontal";
  const getScrollFlags = isHorizontal
    ? getScrollFlagsHorizontal
    : getScrollFlagsVertical;

  const flush = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const next = getScrollFlags(el);
    const prev = lastRef.current;
    const unchanged =
      prev.canScroll === next.canScroll &&
      prev.showStart === next.showStart &&
      prev.showEnd === next.showEnd;
    lastRef.current = next;
    if (unchanged) return;

    if (prev.canScroll !== next.canScroll) setCanScroll(next.canScroll);
    if (startFadeRef.current)
      startFadeRef.current.style.opacity = next.showStart ? "1" : "0";
    if (endFadeRef.current)
      endFadeRef.current.style.opacity = next.showEnd ? "1" : "0";
  }, [getScrollFlags]);

  const onScroll = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      flush();
    });
  }, [flush]);

  const scrollToEndAndFlush = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (isHorizontal && scrollToEndByDefault) {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
    flush();
  }, [isHorizontal, scrollToEndByDefault, flush]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    flush();
    const ro = new ResizeObserver(flush);
    ro.observe(el);
    // Viewport size doesn't change when only content (scrollWidth) grows.
    // Observe the content so we get correct canScroll + faders and scroll-to-end on first layout.
    const content = el.firstElementChild;
    const contentRo = content
      ? new ResizeObserver(scrollToEndAndFlush)
      : null;
    if (contentRo && content) contentRo.observe(content);
    return () => {
      ro.disconnect();
      contentRo?.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [flush, scrollToEndAndFlush]);

  return (
    <ScrollAreaPrimitive.Root
      type="always"
      className={cn(
        "relative",
        isHorizontal
          ? "h-full w-fit max-w-full overflow-hidden"
          : "max-h-[50vh]",
        canScroll && (isHorizontal ? "pb-0" : "pr-4"),
        className
      )}
      style={style}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        onScroll={onScroll}
        className={cn(
          "focus-visible:ring-ring/50 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          isHorizontal
            ? "size-full flex items-center overflow-x-auto overflow-y-hidden"
            : "size-full"
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {isHorizontal ? (
        <ScrollBar
          orientation="horizontal"
          className={cn(hideScrollbar && "opacity-0 pointer-events-none")}
        />
      ) : (
        <>
          <ScrollBar
            className={cn(hideScrollbar && "opacity-0 pointer-events-none")}
          />
          <ScrollAreaPrimitive.Corner />
        </>
      )}
      {isHorizontal ? (
        <>
          <div
            ref={startFadeRef}
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent transition-opacity duration-150"
            style={{ opacity: 0 }}
            aria-hidden
          />
          <div
            ref={endFadeRef}
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent transition-opacity duration-150"
            style={{ opacity: 1 }}
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            ref={startFadeRef}
            className="pointer-events-none absolute top-0 left-0 right-4 z-10 h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-150"
            style={{ opacity: 0 }}
            aria-hidden
          />
          <div
            ref={endFadeRef}
            className="pointer-events-none absolute bottom-0 left-0 right-4 z-10 h-8 bg-gradient-to-t from-background to-transparent transition-opacity duration-150"
            style={{ opacity: 1 }}
            aria-hidden
          />
        </>
      )}
    </ScrollAreaPrimitive.Root>
  );
}
