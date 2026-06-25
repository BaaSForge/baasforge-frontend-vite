import { useMainSidebar } from "@/stores/main-sidebar";
import { useSecondarySidebarVisibility } from "@/stores/secondary-sidebar";
import { cn } from "@/lib/utils";
import {
    breadcrumbStore,
    usePageTitleBoxHeight,
    useStickyBreadcrumbBarHeight,
    useStickyBreadcrumbBarTransition,
    useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import * as React from "react";

const DEFAULT_PAGE_TITLE_BOX_HEIGHT = 48;

export function PageTitleBoxPlaceholder() {
    const height = usePageTitleBoxHeight();
    const effectiveHeight = height > 0 ? height : DEFAULT_PAGE_TITLE_BOX_HEIGHT;
    return <div aria-hidden className="w-full shrink-0" style={{ height: effectiveHeight }} data-slot="page-title-box-placeholder" />;
}

export interface PageTitleBoxProps {
    title: string;
    tools?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    stackToolsOnMobile?: boolean;
}

export function PageTitleBox({
    title,
    tools,
    className,
    children,
    stackToolsOnMobile = false,
}: PageTitleBoxProps) {
    const barRef = React.useRef<HTMLDivElement>(null);
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();
    const mainSidebar = useMainSidebar();
    const secondarySidebar = useSecondarySidebarVisibility();
    const setPageTitleBoxHeight = breadcrumbStore.getState().setPageTitleBoxHeight;

    const pageTitleBoxLeftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const pageTitleBoxRightClassName =
        secondarySidebar.isOpen && !secondarySidebar.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

    const stackToolsLayout = stackToolsOnMobile && tools != null;

    React.useLayoutEffect(() => {
        const el = barRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setPageTitleBoxHeight(el.getBoundingClientRect().height);
        });
        ro.observe(el);
        setPageTitleBoxHeight(el.getBoundingClientRect().height);
        return () => ro.disconnect();
    }, [setPageTitleBoxHeight, stackToolsLayout]);

    const top = stickyBarVisible ? stickyBarHeight : 0;

    return (
        <>
            <PageTitleBoxPlaceholder />
            <div
                ref={barRef}
                data-slot="page-title-box"
                className={cn(
                    "fixed right-0 z-[15] shrink-0 border-b bg-background transition-all",
                    stackToolsLayout
                        ? "grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 max-sm:grid-cols-1 max-sm:h-auto max-sm:items-stretch max-sm:gap-2 max-sm:py-2 md:h-14 md:gap-4 md:px-4"
                        : "flex h-12 flex-row items-center justify-between gap-2 px-3 md:h-14 md:gap-4 md:px-4",
                    stickyBarTransition,
                    `top-[var(--top)]`,
                    pageTitleBoxLeftClassName,
                    pageTitleBoxRightClassName,
                    className,
                )}
                style={{
                    ["--top" as keyof React.CSSProperties]: `${top}px`,
                    ...stickyBarTransitionStyles,
                }}
            >
                <div
                    className={cn(
                        "min-w-0 text-base font-semibold tracking-tight md:text-lg",
                        stackToolsLayout ? "max-sm:whitespace-normal sm:truncate" : "truncate",
                    )}
                >
                    {title}
                </div>
                {tools != null && (
                    <div
                        className={cn(
                            "flex items-center gap-2",
                            stackToolsLayout ? "max-sm:w-full max-sm:justify-end sm:shrink-0" : "shrink-0",
                        )}
                    >
                        {tools}
                    </div>
                )}
                {children}
            </div>
        </>
    );
}
