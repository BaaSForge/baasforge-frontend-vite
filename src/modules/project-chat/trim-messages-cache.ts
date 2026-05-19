import type { InfiniteData } from "@tanstack/react-query";

import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "./types";

function flattenInfiniteMessagesCache(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
): ChatMessageWithDeliveryStatus[] {
    if (old == null) return [];
    return old.pages.flatMap((page) => page);
}

function expandRemovedIdsWithInvokedDescendants(
    messages: readonly ChatMessageWithDeliveryStatus[],
    seedIds: Set<string>,
): Set<string> {
    const toRemove = new Set(seedIds);
    let changed = true;
    while (changed) {
        changed = false;
        for (const m of messages) {
            const parentId = m.invoking_message_id;
            if (parentId && toRemove.has(parentId) && !toRemove.has(m.id)) {
                toRemove.add(m.id);
                changed = true;
            }
        }
    }
    return toRemove;
}

/** Linear successors after the anchor, plus any nested rows invoked by a removed message. */
function collectMessageIdsRemovedAfterAnchor(
    messages: readonly ChatMessageWithDeliveryStatus[],
    anchorMessageId: string,
): Set<string> {
    const anchorIndex = messages.findIndex((m) => m.id === anchorMessageId);
    if (anchorIndex < 0) return new Set();

    const seedIds = new Set<string>();
    for (let i = anchorIndex + 1; i < messages.length; i++) {
        seedIds.add(messages[i]!.id);
    }
    return expandRemovedIdsWithInvokedDescendants(messages, seedIds);
}

/** Anchor, its linear successors, and any nested rows invoked by a removed message. */
function collectMessageIdsRemovedIncludingAnchor(
    messages: readonly ChatMessageWithDeliveryStatus[],
    anchorMessageId: string,
): Set<string> {
    const anchorIndex = messages.findIndex((m) => m.id === anchorMessageId);
    if (anchorIndex < 0) return new Set();

    const seedIds = new Set<string>();
    for (let i = anchorIndex; i < messages.length; i++) {
        seedIds.add(messages[i]!.id);
    }
    return expandRemovedIdsWithInvokedDescendants(messages, seedIds);
}

function filterInfiniteMessagesCacheRemovingIds(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    idsToRemove: Set<string>,
): InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined {
    if (old == null || idsToRemove.size === 0) return old;

    const newPages = old.pages.map((page) => page.filter((m) => !idsToRemove.has(m.id)));
    const removedAny = newPages.some((page, i) => page.length !== old.pages[i]!.length);
    if (!removedAny) return old;

    return { ...old, pages: newPages };
}

function collectReleaseControllerIdsFromRemovedSet(
    messages: readonly ChatMessageWithDeliveryStatus[],
    idsToRemove: Set<string>,
): string[] {
    return messages.filter((m) => idsToRemove.has(m.id) && m.type === ChatMessageType.ReleaseControllerBox).map((m) => m.id);
}

/**
 * Removes every message after `messageId` in the thread (later in time / below in the UI), keeping the anchor row.
 * Also removes nested sub-agent rows invoked by any removed message, even when they appear earlier in the cache.
 */
export function trimInfiniteMessagesCacheRemovingMessagesAfter(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined {
    if (old == null) return old;
    const messages = flattenInfiniteMessagesCache(old);
    const idsToRemove = collectMessageIdsRemovedAfterAnchor(messages, messageId);
    if (idsToRemove.size === 0) return old;
    return filterInfiniteMessagesCacheRemovingIds(old, idsToRemove) ?? old;
}

/**
 * Removes `messageId` and every message that comes after it in the thread (later in time / below in the UI),
 * matching truncate-below plus dropping the edited row.
 */
export function trimInfiniteMessagesCacheRemovingMessageAndAfter(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined {
    if (old == null) return old;
    const messages = flattenInfiniteMessagesCache(old);
    const idsToRemove = collectMessageIdsRemovedIncludingAnchor(messages, messageId);
    if (idsToRemove.size === 0) return old;
    return filterInfiniteMessagesCacheRemovingIds(old, idsToRemove) ?? old;
}

/**
 * IDs of {@link ChatMessageType.ReleaseControllerBox} rows removed by
 * {@link trimInfiniteMessagesCacheRemovingMessagesAfter} for the given anchor message.
 */
export function collectReleaseControllerMessageIdsRemovedAfterMessage(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): string[] {
    const messages = flattenInfiniteMessagesCache(old);
    const idsToRemove = collectMessageIdsRemovedAfterAnchor(messages, messageId);
    return collectReleaseControllerIdsFromRemovedSet(messages, idsToRemove);
}

/**
 * IDs of {@link ChatMessageType.ReleaseControllerBox} rows removed by
 * {@link trimInfiniteMessagesCacheRemovingMessageAndAfter} for the given anchor message.
 */
export function collectReleaseControllerMessageIdsRemovedByTruncateBelow(
    old: InfiniteData<ChatMessageWithDeliveryStatus[]> | undefined,
    messageId: string,
): string[] {
    const messages = flattenInfiniteMessagesCache(old);
    const idsToRemove = collectMessageIdsRemovedIncludingAnchor(messages, messageId);
    return collectReleaseControllerIdsFromRemovedSet(messages, idsToRemove);
}
