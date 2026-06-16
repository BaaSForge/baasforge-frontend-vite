"use client";

import { AppNotificationInboxButton } from "@/components/app-notification-inbox-button";
import { FadedScrollArea } from "@/components/faded-scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";
import {
    breadcrumbStore,
    useBreadcrumbSegmentLabels,
    useStickyBreadcrumbBarHeight,
    useStickyBreadcrumbBarTransition,
    useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import * as React from "react";
import { Link, useLocation, useParams } from "react-router";

const SEGMENT_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    settings: "Settings",
    info: "Info",
    delete: "Delete",
    runtimes: "Runtimes",
    "runtime-env-vars": "Variables",
    usage: "Usage",
    "units-releases": "Units & releases",
};

const DEFAULT_BAR_HEIGHT = 56;
const SCROLL_THRESHOLD = 56;

function getSegmentLabel(segment: string): string {
    return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function StickyBreadcrumbBarPlaceholder() {
    const height = useStickyBreadcrumbBarHeight();
    const effectiveHeight = height > 0 ? height : DEFAULT_BAR_HEIGHT;
    return <div aria-hidden className="w-full shrink-0" style={{ height: effectiveHeight }} data-slot="sticky-breadcrumb-placeholder" />;
}

export function StickyBreadcrumbBar() {
    const barRef = React.useRef<HTMLDivElement>(null);
    const lastScrollYRef = React.useRef(0);
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();
    const { state: sidebarState } = useSidebar();
    const { pathname } = useLocation();
    const params = useParams();
    const segments = pathname.split("/").filter(Boolean);
    const segmentLabels = useBreadcrumbSegmentLabels();
    const setStickyBarVisible = breadcrumbStore.getState().setStickyBarVisible;
    const setStickyBarHeight = breadcrumbStore.getState().setStickyBarHeight;

    const getBreadcrumbLabel = React.useCallback(
        (segment: string): string => {
            for (const [paramName, paramValue] of Object.entries(params)) {
                if (paramValue === segment && segmentLabels[paramName]) {
                    return segmentLabels[paramName];
                }
            }
            return getSegmentLabel(segment);
        },
        [params, segmentLabels],
    );

    React.useLayoutEffect(() => {
        const el = barRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setStickyBarHeight(el.getBoundingClientRect().height);
        });
        ro.observe(el);
        setStickyBarHeight(el.getBoundingClientRect().height);
        return () => ro.disconnect();
    }, [setStickyBarHeight]);

    React.useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY ?? document.documentElement.scrollTop;
            const last = lastScrollYRef.current;
            lastScrollYRef.current = scrollY;

            if (scrollY <= SCROLL_THRESHOLD) {
                setStickyBarVisible(true);
            } else if (scrollY > last) {
                setStickyBarVisible(false);
            } else {
                setStickyBarVisible(true);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [setStickyBarVisible]);

    return (
        <div
            ref={barRef}
            data-slot="sticky-breadcrumb-bar"
            className={cn(
                "fixed left-0 top-0 right-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4",
                "transition-all",
                stickyBarTransition,
                stickyBarVisible ? "translate-y-0" : "-translate-y-full",
                sidebarState === "collapsed" ? "md:left-[var(--sidebar-width-icon)]" : "md:left-[var(--sidebar-width)]",
            )}
            style={{ ...stickyBarTransitionStyles }}
        >
            <StickyBreadcrumbBarInner pathname={pathname} segments={segments} getBreadcrumbLabel={getBreadcrumbLabel} />
        </div>
    );
}

function StickyBreadcrumbBarInner({
    pathname,
    segments,
    getBreadcrumbLabel,
}: {
    pathname: string;
    segments: string[];
    getBreadcrumbLabel: (segment: string) => string;
}) {
    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SidebarTrigger />
                </TooltipTrigger>
                <TooltipContent side="right">Toggle sidebar ({SHORTCUT_LABELS.MAIN_SIDEBAR})</TooltipContent>
            </Tooltip>
            <div className="min-w-0 flex-1 overflow-hidden">
                <FadedScrollArea key={pathname} orientation="horizontal" scrollToEndByDefault hideScrollbar className="h-full w-full">
                    <Breadcrumb className="flex items-center">
                        <BreadcrumbList className="flex-nowrap w-max">
                            {segments.map((segment, i) => {
                                const path = "/" + segments.slice(0, i + 1).join("/");
                                const label = getBreadcrumbLabel(segment);
                                const isLast = i === segments.length - 1;
                                return (
                                    <React.Fragment key={path}>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            {isLast ? (
                                                <BreadcrumbPage>{label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link to={path}>{label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </React.Fragment>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </FadedScrollArea>
            </div>
            <AppNotificationInboxButton />
            <ModeToggle />
        </>
    );
}
