import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SCROLL_END_THRESHOLD = 2;

interface FadedScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function FadedScrollArea({ children, className }: FadedScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [showBottomFade, setShowBottomFade] = React.useState(true);

  const updateFaders = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight;
    setShowTopFade(canScroll && scrollTop > SCROLL_END_THRESHOLD);
    setShowBottomFade(
      canScroll && scrollTop + clientHeight < scrollHeight - SCROLL_END_THRESHOLD
    );
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateFaders();
    const ro = new ResizeObserver(updateFaders);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateFaders, children]);

  return (
    <ScrollAreaPrimitive.Root
      type="always"
      className={cn("relative max-h-[50vh]", className)}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        onScroll={updateFaders}
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
      <div
        className={cn(
          "pointer-events-none absolute top-0 left-0 right-0 z-10 h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-200",
          showTopFade ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-8 bg-gradient-to-t from-background to-transparent transition-opacity duration-300",
          showBottomFade ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
    </ScrollAreaPrimitive.Root>
  );
}
