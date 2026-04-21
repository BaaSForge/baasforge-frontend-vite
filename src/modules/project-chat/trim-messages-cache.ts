import type { InfiniteData } from "@tanstack/react-query";

import type { ChatMessageWithDeliveryStatus } from "./types";

/**
 * Removes `messageId` and every message that comes after it in the thread (later in time / below in the UI),
 * matching truncate-below plus dropping the edited row.
 */
export function trimInfiniteMessagesCacheRemovingMessageAndAfter(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined {
    if (old == null) return old;

    const newPages: ChatMessageWithDeliveryStatus[][] = [];
    let done = false;
    for (const page of old.pages) {
        if (done) break;
        const i = page.findIndex((m) => m.id === messageId);
        if (i >= 0) {
            newPages.push(page.slice(0, i));
            done = true;
        } else {
            newPages.push([...page]);
        }
    }

    if (!done) return old;

    return {
        ...old,
        pages: newPages,
    };
}
