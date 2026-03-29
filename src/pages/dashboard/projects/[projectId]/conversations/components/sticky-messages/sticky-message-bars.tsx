import { Card } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ScrollBehavior } from "@/lib/dom";
import {
    useStickyBreadcrumbBarTransition,
} from "@/stores/breadcrumb";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import * as React from "react";
import { ChevronUp } from "lucide-react";

import { useStickyMessageGroups } from "./sticky-message-groups-context";
import {
    STICKY_MESSAGE_GROUP_GAP_PX,
    STICKY_MESSAGE_GROUP_ORDER,
    STICKY_MESSAGES_STACK_MARGIN_TOP_PX,
    type StickyMessageGroupId,
} from "./sticky-message-groups";
import { StickyMessageLineReleaseController } from "./sticky-message-line-release-controller";
import { StickyMessageLineUser } from "./sticky-message-line-user";
import {
    DEFAULT_ROW_FALLBACK_PX,
    getScrollTargetTopBelowStickyHeadersFromDom,
    scrollWindowToAlignElementTop,
    scrollWindowToAlignElementTopWithCompletion,
} from "./sticky-message-scroll";

type Sidebar = ReturnType<typeof useSidebar>;

export function StickyMessageBars({ mainSidebar: passedSidebar }: { mainSidebar?: Sidebar }) {
    const { getRegistryEntry, getRowHeights, setRowHeight, layoutBaseTopPx, activeByGroup, flashMessageHighlight } =
        useStickyMessageGroups();
    const useSidebarRes = useSidebar();
    const mainSidebar = passedSidebar ?? useSidebarRes;
    const secondarySidebar = passedSidebar ? useSidebarRes : null;

    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();

    const pageTitleBoxLeftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const pageTitleBoxRightClassName =
        secondarySidebar && secondarySidebar.open && !secondarySidebar.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

    const rowRefs = React.useRef<Partial<Record<StickyMessageGroupId, HTMLDivElement | null>>>({});

    React.useLayoutEffect(() => {
        const observers: ResizeObserver[] = [];
        for (const group of STICKY_MESSAGE_GROUP_ORDER) {
            const el = rowRefs.current[group];
            if (!el || activeByGroup[group] == null) continue;
            const ro = new ResizeObserver(() => {
                const h = el.getBoundingClientRect().height;
                if (h > 0) setRowHeight(group, h);
            });
            ro.observe(el);
            observers.push(ro);
            const h = el.getBoundingClientRect().height;
            if (h > 0) setRowHeight(group, h);
        }
        return () => observers.forEach((o) => o.disconnect());
    }, [activeByGroup, setRowHeight]);

    let offsetY = 0;
    let isFirstStickyRow = true;
    const rows: React.ReactNode[] = [];

    for (const group of STICKY_MESSAGE_GROUP_ORDER) {
        const messageId = activeByGroup[group];
        if (messageId == null) continue;
        const entry = getRegistryEntry(group, messageId);
        if (!entry) continue;
        const topPx = layoutBaseTopPx + STICKY_MESSAGES_STACK_MARGIN_TOP_PX + offsetY;
        const rowHeight = getRowHeights()[group] ?? DEFAULT_ROW_FALLBACK_PX;
        offsetY += rowHeight;

        const isFirstSticky = isFirstStickyRow;
        isFirstStickyRow = false;

        rows.push(
            <StickyMessageBarRow
                key={`${group}-${messageId}`}
                group={group}
                ref={(el) => {
                    rowRefs.current[group] = el;
                }}
                message={entry.message}
                isFirstSticky={isFirstSticky}
                topPx={topPx}
                pageTitleBoxLeftClassName={pageTitleBoxLeftClassName}
                pageTitleBoxRightClassName={pageTitleBoxRightClassName}
                stickyBarTransition={stickyBarTransition}
                stickyBarTransitionStyles={stickyBarTransitionStyles}
                onScrollTo={() => {
                    const targetTop = getScrollTargetTopBelowStickyHeadersFromDom();
                    scrollWindowToAlignElementTopWithCompletion(
                        entry.element,
                        targetTop,
                        ScrollBehavior.Smooth,
                        () => {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    const refinedTop = getScrollTargetTopBelowStickyHeadersFromDom();
                                    scrollWindowToAlignElementTop(entry.element, refinedTop, ScrollBehavior.Instant);
                                    queueMicrotask(() => flashMessageHighlight(entry.message.id));
                                });
                            });
                        },
                    );
                }}
            />,
        );
    }

    return <>{rows}</>;
}

const StickyMessageBarRow = React.forwardRef<
    HTMLDivElement,
    {
        group: StickyMessageGroupId;
        message: ChatMessageWithDeliveryStatus;
        isFirstSticky: boolean;
        topPx: number;
        pageTitleBoxLeftClassName: string;
        pageTitleBoxRightClassName: string;
        stickyBarTransition: string;
        stickyBarTransitionStyles: React.CSSProperties;
        onScrollTo: () => void;
    }
>(function StickyMessageBarRow(
    {
        group,
        message,
        isFirstSticky,
        topPx,
        pageTitleBoxLeftClassName,
        pageTitleBoxRightClassName,
        stickyBarTransition,
        stickyBarTransitionStyles,
        onScrollTo,
    },
    ref,
) {
    const label =
        group === "user"
            ? "Pinned user message — click to scroll to message"
            : "Pinned release controller message — click to scroll to message";

    return (
        <div
            className={cn(
                "pointer-events-none fixed right-0 z-[15] flex justify-center px-3 sm:px-4",
                stickyBarTransition,
                pageTitleBoxLeftClassName,
                pageTitleBoxRightClassName,
            )}
            style={{
                top: topPx,
                ...stickyBarTransitionStyles,
            }}
        >
            <Card
                ref={ref}
                data-slot="sticky-message-bar"
                data-sticky-group={group}
                className={cn(
                    "pointer-events-auto flex min-h-10 w-[80%] max-w-[80%] min-w-0 cursor-pointer flex-row gap-0 rounded-xl border-0 bg-inverse/80 px-4 py-2 text-inverse-foreground shadow-none backdrop-blur-md",
                    group === "release_controller" ? "items-start md:items-center" : "items-center",
                    "transition-[background-color,backdrop-filter]",
                    stickyBarTransition,
                )}
                style={{
                    marginTop: !isFirstSticky ? STICKY_MESSAGE_GROUP_GAP_PX : undefined,
                }}
                role="button"
                tabIndex={0}
                aria-label={label}
                onClick={onScrollTo}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onScrollTo();
                    }
                }}
            >
                <div
                    className={cn(
                        "flex min-w-0 flex-1 justify-start gap-1.5 text-left select-none",
                        group === "release_controller" ? "items-start md:items-center" : "items-center",
                    )}
                >
                    <ChevronUp
                        className={cn(
                            "size-4 shrink-0 text-inverse-foreground/85",
                            group === "release_controller" && "mt-0.5 md:mt-0",
                        )}
                        aria-hidden
                    />
                    {group === "user" ? (
                        <StickyMessageLineUser message={message} className="min-w-0 flex-1 text-inverse-foreground" />
                    ) : (
                        <StickyMessageLineReleaseController message={message} className="text-inverse-foreground" />
                    )}
                </div>
            </Card>
        </div>
    );
});
