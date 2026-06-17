"use client";

import { SCROLL_EDGE_FADER_DEFAULT_FROM, ScrollEdgeFader } from "@/components/scroll-edge-fader";
import { useRegisterAppChromeDismissWhenOpen } from "@/hooks/use-register-app-chrome-dismiss";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

/** Shell max height for dialog + drawer (all sizing lives here, not on consumers). */
export const CENTRIC_MODAL_SHELL_MAX_H = "max-h-[80dvh]";

/** Fixed shell height for `fillViewport` desktop dialog (~80% of viewport). */
const CENTRIC_MODAL_SHELL_VIEWPORT_FILL_DESKTOP = "h-[80dvh] max-h-[80dvh]";

/** Fixed shell height for `fillViewport` mobile drawer (~90% of viewport). */
const CENTRIC_MODAL_SHELL_VIEWPORT_FILL_MOBILE = "h-[90dvh] max-h-[90dvh]";

/** Mobile drawer when `tallMobileSheet` is set (e.g. long lists) — slightly taller than fillViewport mobile. */
const CENTRIC_MODAL_SHELL_TALL_MOBILE_SHEET = "h-[95dvh] max-h-[95dvh]";

/** Body scrollport cap (space for header and drawer chrome). */
export const CENTRIC_MODAL_BODY_SCROLL_MAX_H = "max-h-[calc(80dvh-7rem)]";

/**
 * Reject Tailwind utilities that set block-axis size on `CentricModalContent`.
 * Width utilities (`max-w-*`, `w-*`) are allowed.
 */
const DISALLOWED_CENTRIC_MODAL_CONTENT_CLASS =
    /(?:^|\s)(?:[a-z0-9_-]+:)*(?:(?:min-h|max-h|h)-(?:\[[^\]]+\]|[^\s]+)|size-(?:full|auto|\[[^\]]+\]))/;

function assertCentricModalContentClassName(className: string | undefined, context: string) {
    if (!className?.trim()) return;
    if (import.meta.env.DEV && DISALLOWED_CENTRIC_MODAL_CONTENT_CLASS.test(className)) {
        throw new Error(
            `${context}: className must not set height or block size (h-, min-h-, max-h-, size-full, …). ` +
                `Sizing is controlled by CentricModal only (${CENTRIC_MODAL_SHELL_MAX_H}, ${CENTRIC_MODAL_BODY_SCROLL_MAX_H}). ` +
                `Received: ${className}`,
        );
    }
}

const SCROLL_END_THRESHOLD = 2;

function getScrollFlagsVertical(el: HTMLDivElement) {
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight;
    return {
        canScroll,
        showStart: canScroll && scrollTop > SCROLL_END_THRESHOLD,
        showEnd: canScroll && scrollTop + clientHeight < scrollHeight - SCROLL_END_THRESHOLD,
    };
}

/** Native overflow-y + edge fades; lives only in this module (not {@link FadedScrollArea}). */
function CentricModalBodyScroll({
    children,
    isDesktop,
    fillViewport,
    bodyScroll = true,
}: {
    children: React.ReactNode;
    isDesktop?: boolean;
    fillViewport?: boolean;
    /** When false, this region does not scroll; use an inner `min-h-0 flex-1 overflow-y-auto` (or similar) for scroll. */
    bodyScroll?: boolean;
}) {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const startFadeRef = React.useRef<HTMLDivElement>(null);
    const endFadeRef = React.useRef<HTMLDivElement>(null);
    const rafRef = React.useRef<number | null>(null);
    const lastRef = React.useRef({
        canScroll: false,
        showStart: false,
        showEnd: true,
    });
    const isDesktopRef = React.useRef(isDesktop);
    isDesktopRef.current = isDesktop;
    const [reserveScrollbarGutter, setReserveScrollbarGutter] = React.useState(false);

    const flush = React.useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;
        const next = getScrollFlagsVertical(el);
        const prev = lastRef.current;
        const unchanged = prev.canScroll === next.canScroll && prev.showStart === next.showStart && prev.showEnd === next.showEnd;
        lastRef.current = next;
        if (unchanged) return;

        if (!isDesktopRef.current && prev.canScroll !== next.canScroll) {
            setReserveScrollbarGutter(next.canScroll);
        }
        if (startFadeRef.current) startFadeRef.current.style.opacity = next.showStart ? "1" : "0";
        if (endFadeRef.current) endFadeRef.current.style.opacity = next.showEnd ? "1" : "0";
    }, []);

    const onScroll = React.useCallback(() => {
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            flush();
        });
    }, [flush]);

    const scrollToEndAndFlush = React.useCallback(() => {
        flush();
    }, [flush]);

    React.useEffect(() => {
        if (!bodyScroll) return;
        const el = viewportRef.current;
        if (!el) return;
        flush();
        const ro = new ResizeObserver(flush);
        ro.observe(el);
        const content = el.firstElementChild;
        const contentRo = content ? new ResizeObserver(scrollToEndAndFlush) : null;
        if (contentRo && content) contentRo.observe(content);
        return () => {
            ro.disconnect();
            contentRo?.disconnect();
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [flush, scrollToEndAndFlush, isDesktop, bodyScroll]);

    return (
        <div
            className={cn(
                "relative min-w-0",
                fillViewport && "flex min-h-0 min-w-0 flex-1 flex-col",
                !bodyScroll && "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            )}
        >
            <div
                ref={viewportRef}
                onScroll={bodyScroll ? onScroll : undefined}
                tabIndex={bodyScroll ? -1 : undefined}
                className={cn(
                    "focus-visible:ring-ring/50 overflow-x-hidden outline-none focus-visible:ring-[3px] focus-visible:outline-1",
                    bodyScroll ? "overflow-y-auto overscroll-contain" : "flex min-h-0 flex-1 flex-col overflow-y-hidden",
                    bodyScroll && !isDesktop && reserveScrollbarGutter && "[scrollbar-gutter:stable]",
                    isDesktop ? "px-4 pb-4" : "px-0 pb-4 sm:pb-6",
                    bodyScroll
                        ? fillViewport
                            ? "min-h-0 flex-1 max-h-none"
                            : CENTRIC_MODAL_BODY_SCROLL_MAX_H
                        : "min-h-0 flex-1 max-h-none",
                )}
            >
                {children}
            </div>
            {bodyScroll ? (
                <>
                    <ScrollEdgeFader
                        ref={startFadeRef}
                        edge="top"
                        fromClassName={SCROLL_EDGE_FADER_DEFAULT_FROM}
                        className="right-4"
                        style={{ opacity: 0 }}
                    />
                    <ScrollEdgeFader
                        ref={endFadeRef}
                        edge="bottom"
                        fromClassName={SCROLL_EDGE_FADER_DEFAULT_FROM}
                        className="right-4"
                        style={{ opacity: 1 }}
                    />
                </>
            ) : null}
        </div>
    );
}

function splitCentricModalChildren(children: React.ReactNode) {
    const nodes = React.Children.toArray(children);
    const headerIndex = nodes.findIndex((child) => React.isValidElement(child) && child.type === CentricModalHeader);
    const footerIndex = nodes.findIndex((child) => React.isValidElement(child) && child.type === CentricModalFooter);
    const header = headerIndex >= 0 ? nodes[headerIndex] : null;
    const footer = footerIndex >= 0 ? nodes[footerIndex] : null;
    const body = nodes.filter((_, index) => index !== headerIndex && index !== footerIndex);
    return { header, footer, body };
}

function CentricModal({ open, onOpenChange, ...props }: React.ComponentProps<typeof Dialog>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? Drawer : Dialog;
    useRegisterAppChromeDismissWhenOpen(open === true, () => onOpenChange?.(false));
    return <Component open={open} onOpenChange={onOpenChange} {...props} />;
}

function CentricModalTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerTrigger : DialogTrigger;
    return <Component {...props} />;
}

function CentricModalClose(props: React.ComponentProps<typeof DialogClose>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerClose : DialogClose;
    return <Component {...props} />;
}

function CentricModalContent({
    className,
    children,
    showCloseButton = true,
    fillViewport = false,
    fillViewportOnMobile = false,
    bodyScroll = true,
    tallMobileSheet = false,
    decorator,
    footerShellClassName,
    ...props
}: React.ComponentProps<typeof DialogContent> & {
    showCloseButton?: boolean;
    fillViewport?: boolean;
    /** Mobile drawer only: fixed sheet height for sticky footer; desktop stays content-sized. */
    fillViewportOnMobile?: boolean;
    /** When false, the modal body does not create its own scrollport (avoids nested scrollbars). */
    bodyScroll?: boolean;
    /** Mobile drawer only: use a tall fixed sheet (~95dvh); desktop unchanged. */
    tallMobileSheet?: boolean;
    /** Renders behind header, body, and footer; use for full-bleed backgrounds (covers the whole modal shell). */
    decorator?: React.ReactNode;
    /** Desktop dialog only: classes on the footer shell (padding around {@link CentricModalFooter}). */
    footerShellClassName?: string;
}) {
    assertCentricModalContentClassName(className, "CentricModalContent");

    const isMobile = useIsMobile();
    const { header, footer, body } = splitCentricModalChildren(children);
    const shellFillViewport = isMobile ? fillViewport || fillViewportOnMobile : fillViewport;

    const bodyRegion = (
        <CentricModalBodyScroll isDesktop={!isMobile} fillViewport={shellFillViewport} bodyScroll={bodyScroll}>
            {body}
        </CentricModalBodyScroll>
    );

    const bodyShell =
        bodyScroll ? bodyRegion : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{bodyRegion}</div>
        );

    if (isMobile) {
        const mobileDrawerShell = shellFillViewport
            ? CENTRIC_MODAL_SHELL_VIEWPORT_FILL_MOBILE
            : tallMobileSheet
              ? CENTRIC_MODAL_SHELL_TALL_MOBILE_SHEET
              : cn("h-auto", CENTRIC_MODAL_SHELL_MAX_H);

        return (
            <DrawerContent
                className={cn("flex flex-col overflow-hidden", mobileDrawerShell, !bodyScroll && "min-h-0", className)}
                {...props}
            >
                {decorator ? (
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] [&_*]:pointer-events-none">
                        {decorator}
                    </div>
                ) : null}
                <div
                    className={cn(
                        "relative z-10 flex min-w-0 flex-col px-4",
                        (shellFillViewport || tallMobileSheet || !bodyScroll) && "min-h-0 flex-1",
                    )}
                >
                    {header}
                    {bodyShell}
                    {footer}
                </div>
            </DrawerContent>
        );
    }

    return (
        <DialogContent
            className={cn(
                "flex flex-col gap-0 overflow-hidden p-0",
                fillViewport ? cn(CENTRIC_MODAL_SHELL_VIEWPORT_FILL_DESKTOP, "min-h-0") : CENTRIC_MODAL_SHELL_MAX_H,
                !bodyScroll && "min-h-0",
                className,
            )}
            showCloseButton={showCloseButton}
            {...props}
        >
            {decorator ? (
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] [&_*]:pointer-events-none">
                    {decorator}
                </div>
            ) : null}
            {header ? (
                <div className="relative z-10 shrink-0 px-4 pt-4 pb-3 sm:pb-3.5 md:pr-12">
                    {header}
                </div>
            ) : null}
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">{bodyShell}</div>
            {footer ? (
                <div className={cn("relative z-10 shrink-0 px-4 pt-3 pb-4 sm:pb-5", footerShellClassName)}>{footer}</div>
            ) : null}
        </DialogContent>
    );
}

function CentricModalHeader({ className, ...props }: React.ComponentProps<typeof DialogHeader>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerHeader : DialogHeader;
    /** Consistent vertical rhythm between title and trailing content (e.g. badges); drawer defaults are tighter. */
    return <Component className={cn("gap-2", className)} {...props} />;
}

function CentricModalFooter(props: React.ComponentProps<typeof DialogFooter>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerFooter : DialogFooter;
    return <Component {...props} />;
}

function CentricModalTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerTitle : DialogTitle;
    /** Drawer title defaults are lighter than dialog; align both to the same modal heading. */
    return <Component className={cn("text-lg leading-none font-semibold tracking-tight", className)} {...props} />;
}

function CentricModalDescription(props: React.ComponentProps<typeof DialogDescription>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerDescription : DialogDescription;
    return <Component {...props} />;
}

export {
    CentricModal,
    CentricModalClose,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
    CentricModalTrigger,
};
