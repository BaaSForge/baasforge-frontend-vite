import type { InfiniteData } from "@tanstack/react-query";

import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "./types";

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

/**
 * IDs of {@link ChatMessageType.ReleaseControllerBox} rows removed by
 * {@link trimInfiniteMessagesCacheRemovingMessageAndAfter} for the given anchor message.
 * Matches that helper's page walk so prefetch/invalidate does not refetch deleted controllers.
 */
export function collectReleaseControllerMessageIdsRemovedByTruncateBelow(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): string[] {
    if (old == null) return [];

    const ids: string[] = [];
    let done = false;
    for (const page of old.pages) {
        if (done) {
            for (const m of page) {
                if (m.type === ChatMessageType.ReleaseControllerBox) ids.push(m.id);
            }
            continue;
        }
        const i = page.findIndex((m) => m.id === messageId);
        if (i >= 0) {
            for (let j = i; j < page.length; j++) {
                const m = page[j];
                if (m.type === ChatMessageType.ReleaseControllerBox) ids.push(m.id);
            }
            done = true;
        }
    }
    return ids;
}
