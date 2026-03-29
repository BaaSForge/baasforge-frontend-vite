import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { usePageTitleBoxHeight, useStickyBreadcrumbBarHeight, useStickyBreadcrumbBarVisible } from "@/stores/breadcrumb";
import * as React from "react";

import {
    STICKY_MESSAGE_GROUP_GAP_PX,
    STICKY_MESSAGE_GROUP_ORDER,
    STICKY_MESSAGES_STACK_MARGIN_TOP_PX,
    type StickyMessageGroupId,
} from "./sticky-message-groups";
import { DEFAULT_ROW_FALLBACK_PX } from "./sticky-message-scroll";

type RegistryEntry = {
    message: ChatMessageWithDeliveryStatus;
    element: HTMLElement;
};

function emptyActive(): Record<StickyMessageGroupId, string | null> {
    return STICKY_MESSAGE_GROUP_ORDER.reduce(
        (acc, g) => {
            acc[g] = null;
            return acc;
        },
        {} as Record<StickyMessageGroupId, string | null>,
    );
}

function shallowActiveEqual(
    a: Record<StickyMessageGroupId, string | null>,
    b: Record<StickyMessageGroupId, string | null>,
): boolean {
    return STICKY_MESSAGE_GROUP_ORDER.every((g) => a[g] === b[g]);
}

function sortEntriesByDocumentOrder(entries: RegistryEntry[]): RegistryEntry[] {
    return [...entries].sort((a, b) => {
        const pos = a.element.compareDocumentPosition(b.element);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    });
}

type StickyMessageGroupsContextValue = {
    register: (group: StickyMessageGroupId, message: ChatMessageWithDeliveryStatus, element: HTMLElement) => void;
    unregister: (group: StickyMessageGroupId, messageId: string) => void;
    getRowHeights: () => Readonly<Partial<Record<StickyMessageGroupId, number>>>;
    setRowHeight: (group: StickyMessageGroupId, heightPx: number) => void;
    getRegistryEntry: (group: StickyMessageGroupId, messageId: string) => RegistryEntry | undefined;
    layoutBaseTopPx: number;
    activeByGroup: Record<StickyMessageGroupId, string | null>;
    /** Set after scroll-to-message; Message reads this for a short highlight pulse. */
    highlightedMessageId: string | null;
    flashMessageHighlight: (messageId: string) => void;
};

const StickyMessageGroupsContext = React.createContext<StickyMessageGroupsContextValue | null>(null);

export function StickyMessageGroupsProvider({ children }: { children: React.ReactNode }) {
    const layoutBaseTopPx = useLayoutBaseTopPx();

    const registryRef = React.useRef<Map<StickyMessageGroupId, Map<string, RegistryEntry>>>(new Map());
    const rowHeightsRef = React.useRef<Partial<Record<StickyMessageGroupId, number>>>({});
    const [activeByGroup, setActiveByGroup] = React.useState<Record<StickyMessageGroupId, string | null>>(emptyActive);

    /** Sticky row only for messages fully scrolled past the line: bottom edge above threshold (not only top). */
    const findActiveForGroup = React.useCallback((group: StickyMessageGroupId, thresholdTop: number): string | null => {
        const map = registryRef.current.get(group);
        if (!map || map.size === 0) return null;
        const entries = sortEntriesByDocumentOrder([...map.values()].filter((e) => e.element.isConnected));
        let last: string | null = null;
        for (const e of entries) {
            const bottom = e.element.getBoundingClientRect().bottom;
            if (bottom < thresholdTop) {
                last = e.message.id;
            }
        }
        return last;
    }, []);

    const recomputeActive = React.useCallback(() => {
        let threshold = layoutBaseTopPx + STICKY_MESSAGES_STACK_MARGIN_TOP_PX;
        const next = emptyActive();
        for (let i = 0; i < STICKY_MESSAGE_GROUP_ORDER.length; i++) {
            const group = STICKY_MESSAGE_GROUP_ORDER[i]!;
            const id = findActiveForGroup(group, threshold);
            next[group] = id;
            if (id != null) {
                threshold += rowHeightsRef.current[group] ?? DEFAULT_ROW_FALLBACK_PX;
                if (i < STICKY_MESSAGE_GROUP_ORDER.length - 1) {
                    threshold += STICKY_MESSAGE_GROUP_GAP_PX;
                }
            }
        }
        setActiveByGroup((prev) => (shallowActiveEqual(prev, next) ? prev : next));
    }, [findActiveForGroup, layoutBaseTopPx]);

    React.useLayoutEffect(() => {
        recomputeActive();
    }, [recomputeActive]);

    React.useEffect(() => {
        const onScroll = () => recomputeActive();
        const onResize = () => recomputeActive();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [recomputeActive]);

    const register = React.useCallback(
        (group: StickyMessageGroupId, message: ChatMessageWithDeliveryStatus, element: HTMLElement) => {
            let map = registryRef.current.get(group);
            if (!map) {
                map = new Map();
                registryRef.current.set(group, map);
            }
            map.set(message.id, { message, element });
            queueMicrotask(() => recomputeActive());
        },
        [recomputeActive],
    );

    const unregister = React.useCallback(
        (group: StickyMessageGroupId, messageId: string) => {
            const map = registryRef.current.get(group);
            map?.delete(messageId);
            if (map?.size === 0) registryRef.current.delete(group);
            queueMicrotask(() => recomputeActive());
        },
        [recomputeActive],
    );

    const getRegistryEntry = React.useCallback((group: StickyMessageGroupId, messageId: string) => {
        return registryRef.current.get(group)?.get(messageId);
    }, []);

    const getRowHeights = React.useCallback(() => rowHeightsRef.current, []);

    const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);
    const highlightClearTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const flashMessageHighlight = React.useCallback((messageId: string) => {
        if (highlightClearTimeoutRef.current != null) {
            clearTimeout(highlightClearTimeoutRef.current);
        }
        setHighlightedMessageId(messageId);
        highlightClearTimeoutRef.current = setTimeout(() => {
            setHighlightedMessageId(null);
            highlightClearTimeoutRef.current = null;
        }, 3800);
    }, []);

    React.useEffect(() => {
        return () => {
            if (highlightClearTimeoutRef.current != null) {
                clearTimeout(highlightClearTimeoutRef.current);
            }
        };
    }, []);

    const setRowHeight = React.useCallback(
        (group: StickyMessageGroupId, heightPx: number) => {
            const prev = rowHeightsRef.current[group];
            if (prev === heightPx) return;
            rowHeightsRef.current = { ...rowHeightsRef.current, [group]: heightPx };
            queueMicrotask(() => recomputeActive());
        },
        [recomputeActive],
    );

    const value = React.useMemo(
        () =>
            ({
                register,
                unregister,
                getRowHeights,
                setRowHeight,
                getRegistryEntry,
                layoutBaseTopPx,
                activeByGroup,
                highlightedMessageId,
                flashMessageHighlight,
            }) satisfies StickyMessageGroupsContextValue,
        [
            register,
            unregister,
            getRowHeights,
            setRowHeight,
            getRegistryEntry,
            layoutBaseTopPx,
            activeByGroup,
            highlightedMessageId,
            flashMessageHighlight,
        ],
    );

    return <StickyMessageGroupsContext.Provider value={value}>{children}</StickyMessageGroupsContext.Provider>;
}

function useLayoutBaseTopPx(): number {
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const pageTitleBoxHeight = usePageTitleBoxHeight();
    return (stickyBarVisible ? stickyBarHeight : 0) + pageTitleBoxHeight;
}

export function useStickyMessageGroups(): StickyMessageGroupsContextValue {
    const ctx = React.useContext(StickyMessageGroupsContext);
    if (!ctx) {
        throw new Error("useStickyMessageGroups must be used within StickyMessageGroupsProvider");
    }
    return ctx;
}

export function useStickyMessageOptional(): StickyMessageGroupsContextValue | null {
    return React.useContext(StickyMessageGroupsContext);
}

export function useStickyMessageRegistration(
    groupId: StickyMessageGroupId | null,
    message: ChatMessageWithDeliveryStatus,
    elementRef: React.RefObject<HTMLElement | null>,
) {
    const ctx = useStickyMessageOptional();

    React.useLayoutEffect(() => {
        const el = elementRef.current;
        if (ctx == null || groupId == null || !el) return;
        ctx.register(groupId, message, el);
        return () => ctx.unregister(groupId, message.id);
    }, [ctx, groupId, message, elementRef]);
}
