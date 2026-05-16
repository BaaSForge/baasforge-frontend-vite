import { ScrollBehavior, scrollToBottom } from "@/lib/dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SCROLL_FOLLOW_BOTTOM_THRESHOLD_PX = 8;

function getScrollRoot() {
    return document.scrollingElement ?? document.documentElement;
}

function isNearDocumentBottom(root: Element) {
    const maxScrollTop = Math.max(0, root.scrollHeight - root.clientHeight);
    if (maxScrollTop <= SCROLL_FOLLOW_BOTTOM_THRESHOLD_PX) {
        return true;
    }
    return root.scrollTop >= maxScrollTop - SCROLL_FOLLOW_BOTTOM_THRESHOLD_PX;
}

export function useFollowBottomOnNewMessages({
    conversationId,
    isLoadingMessages,
    messagesDep,
    extraScrollTrigger,
}: {
    conversationId: string | undefined;
    isLoadingMessages: boolean;
    messagesDep: unknown;
    /** Layout changes that are not reflected in `messagesDep` (e.g. typing placeholder height). */
    extraScrollTrigger?: unknown;
}) {
    const followRef = useRef(true);
    const [pinnedToBottom, setPinnedToBottom] = useState(true);

    const setPinned = useCallback((pinned: boolean) => {
        followRef.current = pinned;
        setPinnedToBottom((prev) => (prev === pinned ? prev : pinned));
    }, []);

    const syncPinnedFromUserScroll = useCallback(() => {
        setPinned(isNearDocumentBottom(getScrollRoot()));
    }, [setPinned]);

    const followBottomIfLocked = useCallback(() => {
        if (!followRef.current) return;
        scrollToBottom();
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            setPinned(true);
        });
    }, [conversationId, setPinned]);

    useEffect(() => {
        queueMicrotask(syncPinnedFromUserScroll);
        const onScroll = (event: Event) => {
            if (!event.isTrusted) return;
            syncPinnedFromUserScroll();
        };
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        return () => window.removeEventListener("scroll", onScroll, { capture: true });
    }, [syncPinnedFromUserScroll]);

    useEffect(() => {
        if (conversationId == null || conversationId === "") return;
        const body = document.body;
        if (!body) return;

        const ro = new ResizeObserver(() => {
            if (isLoadingMessages) return;
            followBottomIfLocked();
        });
        ro.observe(body);
        return () => ro.disconnect();
    }, [conversationId, isLoadingMessages, followBottomIfLocked]);

    useLayoutEffect(() => {
        if (conversationId == null || conversationId === "") return;
        if (isLoadingMessages) return;
        followBottomIfLocked();
    }, [messagesDep, conversationId, isLoadingMessages, extraScrollTrigger, followBottomIfLocked]);

    const jumpToBottom = useCallback(() => {
        setPinned(true);
        scrollToBottom(undefined, ScrollBehavior.Smooth);
        requestAnimationFrame(() => {
            requestAnimationFrame(syncPinnedFromUserScroll);
        });
    }, [setPinned, syncPinnedFromUserScroll]);

    return { pinnedToBottom, jumpToBottom };
}
