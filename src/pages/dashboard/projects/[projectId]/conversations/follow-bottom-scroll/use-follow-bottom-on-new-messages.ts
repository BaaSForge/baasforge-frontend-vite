import { ScrollBehavior, scrollToBottom } from "@/lib/dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SCROLL_FOLLOW_BOTTOM_THRESHOLD_PX = 8;

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

    const syncPinnedFromScroll = useCallback(() => {
        const root = document.scrollingElement ?? document.documentElement;
        const near =
            root.scrollTop + root.clientHeight >= root.scrollHeight - SCROLL_FOLLOW_BOTTOM_THRESHOLD_PX;
        followRef.current = near;
        setPinnedToBottom((prev) => (prev === near ? prev : near));
    }, []);

    useEffect(() => {
        followRef.current = true;
        setPinnedToBottom(true);
    }, [conversationId]);

    useEffect(() => {
        syncPinnedFromScroll();
        window.addEventListener("scroll", syncPinnedFromScroll, { passive: true, capture: true });
        return () => window.removeEventListener("scroll", syncPinnedFromScroll, { capture: true });
    }, [syncPinnedFromScroll]);

    useLayoutEffect(() => {
        if (conversationId == null || conversationId === "") return;
        if (isLoadingMessages) return;
        if (!followRef.current) return;
        scrollToBottom();
        requestAnimationFrame(syncPinnedFromScroll);
    }, [messagesDep, conversationId, isLoadingMessages, extraScrollTrigger, syncPinnedFromScroll]);

    const jumpToBottom = useCallback(() => {
        followRef.current = true;
        scrollToBottom(undefined, ScrollBehavior.Smooth);
        requestAnimationFrame(() => {
            requestAnimationFrame(syncPinnedFromScroll);
        });
    }, [syncPinnedFromScroll]);

    return { pinnedToBottom, jumpToBottom };
}
