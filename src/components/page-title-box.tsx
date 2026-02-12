import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  breadcrumbStore,
  usePageTitleBoxHeight,
  useStickyBreadcrumbBarHeight,
  useStickyBreadcrumbBarTransition,
  useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_TITLE_BOX_HEIGHT = 56;

export function PageTitleBoxPlaceholder() {
  const height = usePageTitleBoxHeight();
  const effectiveHeight =
    height > 0 ? height : DEFAULT_PAGE_TITLE_BOX_HEIGHT;
  return (
    <div
      aria-hidden
      className="w-full shrink-0"
      style={{ height: effectiveHeight }}
      data-slot="page-title-box-placeholder"
    />
  );
}

export interface PageTitleBoxProps {
  title: string;
  tools?: React.ReactNode;
  className?: string;
}

export function PageTitleBox({ title, tools, className }: PageTitleBoxProps) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const stickyBarVisible = useStickyBreadcrumbBarVisible();
  const stickyBarHeight = useStickyBreadcrumbBarHeight();
  const stickyBarTransition = useStickyBreadcrumbBarTransition();
  const { state: sidebarState } = useSidebar();
  const setPageTitleBoxHeight = breadcrumbStore.getState().setPageTitleBoxHeight;

  React.useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPageTitleBoxHeight(el.getBoundingClientRect().height);
    });
    ro.observe(el);
    setPageTitleBoxHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [setPageTitleBoxHeight]);

  const top = stickyBarVisible ? stickyBarHeight : 0;

  return (
    <>
      <PageTitleBoxPlaceholder />
      <div
        ref={barRef}
        data-slot="page-title-box"
        className={cn(
          "fixed right-0 z-10 flex h-14 shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-4",
          "bg-background transition-[top]",
          "left-0",
          sidebarState === "collapsed"
            ? "md:left-[var(--sidebar-width-icon)]"
            : "md:left-[var(--sidebar-width)]",
          className
        )}
        style={{
          top,
          transition: `top ${stickyBarTransition}`,
        }}
      >
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        {tools != null && (
          <div className="flex shrink-0 items-center">{tools}</div>
        )}
      </div>
    </>
  );
}
