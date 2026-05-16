import { useSidebar } from "@/components/ui/sidebar";
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
type Sidebar = ReturnType<typeof useSidebar>;

export function PageTitleBoxPlaceholder() {
    const height = usePageTitleBoxHeight();
    const effectiveHeight = height > 0 ? height : DEFAULT_PAGE_TITLE_BOX_HEIGHT;
    return <div aria-hidden className="w-full shrink-0" style={{ height: effectiveHeight }} data-slot="page-title-box-placeholder" />;
}

export interface PageTitleBoxProps {
    title: string;
    tools?: React.ReactNode;
    className?: string;
    mainSidebar?: Sidebar;
    children?: React.ReactNode;
    stackToolsOnMobile?: boolean;
}

export function PageTitleBox({
    title,
    tools,
    className,
    mainSidebar: passedSidebar,
    children,
    stackToolsOnMobile = false,
}: PageTitleBoxProps) {
    const barRef = React.useRef<HTMLDivElement>(null);
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();
    const useSidebarRes = useSidebar();
    const setPageTitleBoxHeight = breadcrumbStore.getState().setPageTitleBoxHeight;

    const mainSidebar = passedSidebar ?? useSidebarRes;
    const secondarySidebar = passedSidebar ? useSidebarRes : null;

    const pageTitleBoxLeftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const pageTitleBoxRightClassName = secondarySidebar && secondarySidebar.open && !secondarySidebar.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

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
    const stackTools = stackToolsOnMobile && tools != null;

    return (
        <>
            <PageTitleBoxPlaceholder />
            <div
                ref={barRef}
                data-slot="page-title-box"
                className={cn(
                    "fixed right-0 z-[15] flex shrink-0 border-b px-3 bg-background transition-all",
                    stackTools
                        ? "min-h-12 h-auto flex-col items-stretch gap-2 py-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0"
                        : "h-12 flex-row items-center justify-between gap-2 md:h-14 md:gap-4",
                    "md:px-4",
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
                        "text-base font-semibold tracking-tight md:text-lg",
                        stackTools ? "min-w-0 md:truncate" : "min-w-0 truncate",
                    )}
                >
                    {title}
                </div>
                {tools != null && (
                    <div
                        className={cn(
                            "flex items-center",
                            stackTools ? "w-full shrink-0 justify-end gap-2 md:w-auto md:justify-start" : "shrink-0",
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
