import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SCROLL_END_THRESHOLD = 2;

interface FadedScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

function getScrollFlags(el: HTMLDivElement) {
  const { scrollTop, scrollHeight, clientHeight } = el;
  const canScroll = scrollHeight > clientHeight;
  return {
    canScroll,
    showTop: canScroll && scrollTop > SCROLL_END_THRESHOLD,
    showBottom:
      canScroll && scrollTop + clientHeight < scrollHeight - SCROLL_END_THRESHOLD,
  };
}

export function FadedScrollArea({ children, className }: FadedScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const topFadeRef = React.useRef<HTMLDivElement>(null);
  const bottomFadeRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef({ canScroll: false, showTop: false, showBottom: true });
  const [canScroll, setCanScroll] = React.useState(false);

  const flush = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const next = getScrollFlags(el);
    const prev = lastRef.current;
    const unchanged =
      prev.canScroll === next.canScroll &&
      prev.showTop === next.showTop &&
      prev.showBottom === next.showBottom;
    lastRef.current = next;
    if (unchanged) return;

    if (prev.canScroll !== next.canScroll) setCanScroll(next.canScroll);
    if (topFadeRef.current)
      topFadeRef.current.style.opacity = next.showTop ? "1" : "0";
    if (bottomFadeRef.current)
      bottomFadeRef.current.style.opacity = next.showBottom ? "1" : "0";
  }, []);

  const onScroll = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      flush();
    });
  }, [flush]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    flush();
    const ro = new ResizeObserver(flush);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [flush]);

  return (
    <ScrollAreaPrimitive.Root
      type="always"
      className={cn(
        "relative max-h-[50vh]",
        canScroll && "pr-4",
        className
      )}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        onScroll={onScroll}
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
      <div
        ref={topFadeRef}
        className="pointer-events-none absolute top-0 left-0 right-4 z-10 h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-150"
        style={{ opacity: 0 }}
        aria-hidden
      />
      <div
        ref={bottomFadeRef}
        className="pointer-events-none absolute bottom-0 left-0 right-4 z-10 h-8 bg-gradient-to-t from-background to-transparent transition-opacity duration-150"
        style={{ opacity: 1 }}
        aria-hidden
      />
    </ScrollAreaPrimitive.Root>
  );
}
