"use client";

import { SCROLL_EDGE_FADER_DEFAULT_FROM, ScrollEdgeFader } from "@/components/scroll-edge-fader";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

/** Shell max height for dialog + drawer (all sizing lives here, not on consumers). */
export const CENTRIC_MODAL_SHELL_MAX_H = "max-h-[80dvh]";

/** Fixed shell height for `fillViewport` desktop dialog (~80% of viewport). */
const CENTRIC_MODAL_SHELL_VIEWPORT_FILL_DESKTOP = "h-[80dvh] max-h-[80dvh]";

/** Fixed shell height for `fillViewport` mobile drawer (~90% of viewport). */
const CENTRIC_MODAL_SHELL_VIEWPORT_FILL_MOBILE = "h-[90dvh] max-h-[90dvh]";

/** Body scrollport cap (space for header, close, drawer handle). */
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
}: {
    children: React.ReactNode;
    isDesktop?: boolean;
    fillViewport?: boolean;
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

    const flush = React.useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;
        const next = getScrollFlagsVertical(el);
        const prev = lastRef.current;
        const unchanged = prev.canScroll === next.canScroll && prev.showStart === next.showStart && prev.showEnd === next.showEnd;
        lastRef.current = next;
        if (unchanged) return;

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
    }, [flush, scrollToEndAndFlush]);

    return (
        <div className={cn("relative min-w-0", fillViewport && "flex min-h-0 min-w-0 flex-1 flex-col")}>
            <div
                ref={viewportRef}
                onScroll={onScroll}
                tabIndex={-1}
                className={cn(
                    "focus-visible:ring-ring/50 overflow-y-auto overflow-x-hidden overscroll-contain outline-none focus-visible:ring-[3px] focus-visible:outline-1",
                    /* Desktop: no reserved gutter — matches header/footer horizontal inset (`px-4`). Mobile keeps stable gutter. */
                    !isDesktop && "[scrollbar-gutter:stable]",
                    isDesktop
                        ? "px-4 pb-4"
                        : "px-4 pb-4 sm:px-6 sm:pb-6",
                    fillViewport ? "min-h-0 flex-1 max-h-none" : CENTRIC_MODAL_BODY_SCROLL_MAX_H,
                )}
            >
                {children}
            </div>
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

function CentricModal(props: React.ComponentProps<typeof Dialog>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? Drawer : Dialog;
    return <Component {...props} />;
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
    ...props
}: React.ComponentProps<typeof DialogContent> & { showCloseButton?: boolean; fillViewport?: boolean }) {
    assertCentricModalContentClassName(className, "CentricModalContent");

    const isMobile = useIsMobile();
    const { header, footer, body } = splitCentricModalChildren(children);

    const bodyRegion = (
        <CentricModalBodyScroll isDesktop={!isMobile} fillViewport={fillViewport}>
            {body}
        </CentricModalBodyScroll>
    );

    if (isMobile) {
        return (
            <DrawerContent
                className={cn(
                    "flex flex-col overflow-hidden",
                    fillViewport ? CENTRIC_MODAL_SHELL_VIEWPORT_FILL_MOBILE : cn("h-auto", CENTRIC_MODAL_SHELL_MAX_H),
                    className,
                )}
                {...props}
            >
                <div className={cn("flex min-w-0 flex-col", fillViewport && "min-h-0 flex-1")}>
                    {header}
                    {bodyRegion}
                    {footer}
                </div>
                {showCloseButton && (
                    <DrawerClose className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DrawerClose>
                )}
            </DrawerContent>
        );
    }

    return (
        <DialogContent
            className={cn(
                "flex flex-col gap-0 overflow-hidden p-0",
                fillViewport ? cn(CENTRIC_MODAL_SHELL_VIEWPORT_FILL_DESKTOP, "min-h-0") : CENTRIC_MODAL_SHELL_MAX_H,
                className,
            )}
            showCloseButton={showCloseButton}
            {...props}
        >
            {header ? (
                <div className="shrink-0 px-4 pt-4 pb-3 sm:pb-3.5">
                    {header}
                </div>
            ) : null}
            {bodyRegion}
            {footer ? <div className="shrink-0 px-4 pt-3 pb-4 sm:pb-5">{footer}</div> : null}
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
