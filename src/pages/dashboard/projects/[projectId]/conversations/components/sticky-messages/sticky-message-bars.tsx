import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMainSidebar } from "@/stores/main-sidebar";
import { useSecondarySidebarVisibility } from "@/stores/secondary-sidebar";
import { useStickyBreadcrumbBarTransition } from "@/stores/breadcrumb";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import * as React from "react";
import { ChevronUp, Rocket } from "lucide-react";
import { useStickyMessageGroups } from "./sticky-message-groups-context";
import {
    STICKY_MESSAGE_GROUP_GAP_PX,
    STICKY_MESSAGE_GROUP_ORDER,
    STICKY_MESSAGES_STACK_MARGIN_TOP_PX,
    STICKY_USER_RELEASE_COMBINED_GAP_PX,
    type StickyMessageGroupId,
} from "./sticky-message-groups";

import { getReleaseControllerStickyLineText, StickyMessageLineReleaseController } from "./sticky-message-line-release-controller";
import { MIDDLE_CONTENT_CLASSNAME } from "../../constants";
import { StickyMessageLineUser } from "./sticky-message-line-user";
import { DEFAULT_ROW_FALLBACK_PX, smoothScrollWindowToAlignElementBelowStickyHeaders } from "./sticky-message-scroll";

/** Matches chat column: `Container` horizontal padding + `MIDDLE_CONTENT_CLASSNAME` width. */
const stickyMessageBarWidthClassName = cn(MIDDLE_CONTENT_CLASSNAME, "min-w-0");

export function StickyMessageBars() {
    const {
        getRegistryEntry,
        getRowHeights,
        setRowHeight,
        setCombinedRowHeight,
        layoutBaseTopPx,
        activeByGroup,
        flashMessageHighlight,
    } = useStickyMessageGroups();
    const mainSidebar = useMainSidebar();
    const secondarySidebar = useSecondarySidebarVisibility();

    const { classes: stickyBarTransition, styles: stickyBarTransitionStyles } = useStickyBreadcrumbBarTransition();

    const pageTitleBoxLeftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const pageTitleBoxRightClassName =
        secondarySidebar.isOpen && !secondarySidebar.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

    const rowRefs = React.useRef<Partial<Record<StickyMessageGroupId, HTMLDivElement | null>>>({});
    const combinedBarRef = React.useRef<HTMLDivElement | null>(null);

    const userId = activeByGroup.user;
    const releaseId = activeByGroup.release_controller;
    const userEntry = userId != null ? getRegistryEntry("user", userId) : undefined;
    const releaseEntry = releaseId != null ? getRegistryEntry("release_controller", releaseId) : undefined;
    const showCombinedSticky = userEntry != null && releaseEntry != null;

    React.useLayoutEffect(() => {
        if (showCombinedSticky) {
            const el = combinedBarRef.current;
            if (!el) return;
            const ro = new ResizeObserver(() => {
                const h = el.getBoundingClientRect().height;
                if (h > 0) setCombinedRowHeight(h);
            });
            ro.observe(el);
            const h = el.getBoundingClientRect().height;
            if (h > 0) setCombinedRowHeight(h);
            return () => {
                ro.disconnect();
                setCombinedRowHeight(null);
            };
        }

        setCombinedRowHeight(null);
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
    }, [activeByGroup, setCombinedRowHeight, setRowHeight, showCombinedSticky]);

    let offsetY = 0;
    let isFirstStickyRow = true;
    const rows: React.ReactNode[] = [];

    if (showCombinedSticky && userEntry && releaseEntry) {
        const topPx = layoutBaseTopPx + STICKY_MESSAGES_STACK_MARGIN_TOP_PX + offsetY;
        const rowHeight = getRowHeights().combined ?? DEFAULT_ROW_FALLBACK_PX;
        offsetY += rowHeight;
        const isFirstSticky = isFirstStickyRow;
        isFirstStickyRow = false;

        rows.push(
            <CombinedStickyMessageBarRow
                key={`combined-${userEntry.message.id}-${releaseEntry.message.id}`}
                ref={combinedBarRef}
                userMessage={userEntry.message}
                releaseMessage={releaseEntry.message}
                isFirstSticky={isFirstSticky}
                topPx={topPx}
                pageTitleBoxLeftClassName={pageTitleBoxLeftClassName}
                pageTitleBoxRightClassName={pageTitleBoxRightClassName}
                stickyBarTransition={stickyBarTransition}
                stickyBarTransitionStyles={stickyBarTransitionStyles}
                onScrollToUser={() => {
                    smoothScrollWindowToAlignElementBelowStickyHeaders(userEntry.element, () => {
                        queueMicrotask(() => flashMessageHighlight(userEntry.message.id));
                    });
                }}
                onScrollToRelease={() => {
                    smoothScrollWindowToAlignElementBelowStickyHeaders(releaseEntry.element, () => {
                        queueMicrotask(() => flashMessageHighlight(releaseEntry.message.id));
                    });
                }}
            />,
        );
    } else {
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
                        smoothScrollWindowToAlignElementBelowStickyHeaders(entry.element, () => {
                            queueMicrotask(() => flashMessageHighlight(entry.message.id));
                        });
                    }}
                />,
            );
        }
    }

    return <>{rows}</>;
}

const stickyBarSurfaceClassName =
    "rounded-xl border border-inverse-foreground/15 bg-inverse/80 py-1 pl-2 pr-2.5 text-inverse-foreground shadow-none backdrop-blur-md transition-[background-color,backdrop-filter]";

/** Combined row only: compact release target — square with centered icon (not a text strip). */
const stickyReleaseSquareClassName =
    "rounded-xl border border-inverse-foreground/15 bg-inverse/80 text-inverse-foreground shadow-none backdrop-blur-md transition-[background-color,backdrop-filter]";

const CombinedStickyMessageBarRow = React.forwardRef<
    HTMLDivElement,
    {
        userMessage: ChatMessageWithDeliveryStatus;
        releaseMessage: ChatMessageWithDeliveryStatus;
        isFirstSticky: boolean;
        topPx: number;
        pageTitleBoxLeftClassName: string;
        pageTitleBoxRightClassName: string;
        stickyBarTransition: string;
        stickyBarTransitionStyles: React.CSSProperties;
        onScrollToUser: () => void;
        onScrollToRelease: () => void;
    }
>(function CombinedStickyMessageBarRow(
    {
        userMessage,
        releaseMessage,
        isFirstSticky,
        topPx,
        pageTitleBoxLeftClassName,
        pageTitleBoxRightClassName,
        stickyBarTransition,
        stickyBarTransitionStyles,
        onScrollToUser,
        onScrollToRelease,
    },
    ref,
) {
    return (
        <div
            className={cn(
                "pointer-events-none fixed right-0 z-[15] flex px-4",
                stickyBarTransition,
                pageTitleBoxLeftClassName,
                pageTitleBoxRightClassName,
            )}
            style={{
                top: topPx,
                ...stickyBarTransitionStyles,
            }}
        >
            <div
                ref={ref}
                data-slot="sticky-message-bar"
                data-sticky-combined="user-release"
                className={cn(
                    stickyMessageBarWidthClassName,
                    "pointer-events-auto flex min-h-9 min-w-0 flex-1 flex-row items-stretch",
                    stickyBarTransition,
                )}
                style={{
                    marginTop: !isFirstSticky ? STICKY_MESSAGE_GROUP_GAP_PX : undefined,
                    gap: STICKY_USER_RELEASE_COMBINED_GAP_PX,
                }}
            >
                <div
                    className={cn(
                        stickyBarSurfaceClassName,
                        "flex min-h-9 min-w-0 flex-1 cursor-pointer flex-row items-center gap-1.5 self-stretch select-none",
                        stickyBarTransition,
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label="Pinned user message — click to scroll to message"
                    onClick={onScrollToUser}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onScrollToUser();
                        }
                    }}
                >
                    <ChevronUp className="size-4 shrink-0 text-inverse-foreground/85" aria-hidden />
                    <StickyMessageLineUser message={userMessage} className="min-w-0 flex-1" />
                </div>
                <button
                    type="button"
                    className={cn(
                        stickyReleaseSquareClassName,
                        "box-border flex size-8 shrink-0 cursor-pointer items-center justify-center self-center touch-manipulation outline-none",
                        "hover:bg-inverse/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        stickyBarTransition,
                    )}
                    title={getReleaseControllerStickyLineText(releaseMessage)}
                    aria-label="Pinned release controller message — click to scroll to message"
                    onClick={onScrollToRelease}
                >
                    <Rocket className="size-4 shrink-0 text-inverse-foreground/90" aria-hidden />
                </button>
            </div>
        </div>
    );
});

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
                "pointer-events-none fixed right-0 z-[15] flex px-4",
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
                    stickyMessageBarWidthClassName,
                    "pointer-events-auto flex min-h-9 min-w-0 flex-1 cursor-pointer flex-row gap-0 rounded-xl border border-inverse-foreground/15 bg-inverse/80 py-1 pl-2 pr-4 text-inverse-foreground shadow-none backdrop-blur-md",
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
                        <StickyMessageLineUser message={message} className="min-w-0 flex-1" />
                    ) : (
                        <StickyMessageLineReleaseController message={message} className="text-inverse-foreground" />
                    )}
                </div>
            </Card>
        </div>
    );
});
