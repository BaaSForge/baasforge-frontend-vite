import type { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import {
    isChatSessionGenerationEndedEvent,
    isChatSessionGenerationStartedEvent,
    isChatSessionMessageCreatedEvent,
    isChatSessionMessageStatusChangeEvent,
    isChatSessionMessageUpdatedEvent,
    isChatSessionNewMessageChunkEvent,
} from "@/lib/ws-events";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    type ChatMessageResponse,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
} from "@/modules/project-chat/types";
import type { InfiniteData } from "@tanstack/react-query";

const NO_STREAM = -1 as const;

function applyChunkToMessageInPages(
    pages: ChatMessageWithDeliveryStatus[][],
    messageId: string,
    content: string,
    done: boolean,
): ChatMessageWithDeliveryStatus[][] {
    for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i];
        const idx = page.findIndex((msg) => msg.id === messageId);
        if (idx === -1) continue;
        const msg = page[idx];
        const currentText =
            typeof msg.payload === "string"
                ? msg.payload
                : msg.payload != null && typeof msg.payload === "object" && "text" in msg.payload
                  ? (msg.payload as TextMessagePayload).text ?? ""
                  : "";
        const newPayload: TextMessagePayload =
            msg.payload != null && typeof msg.payload === "object" && !Array.isArray(msg.payload) && "text" in msg.payload
                ? { ...(msg.payload as TextMessagePayload), text: currentText + content }
                : { text: currentText + content };
        const updated: ChatMessageWithDeliveryStatus = {
            ...msg,
            payload: newPayload,
            status: done ? ChatMessageStatus.Completed : ChatMessageStatus.Generating,
        };
        const newPage = [...page];
        newPage[idx] = updated;
        return [...pages.slice(0, i), newPage, ...pages.slice(i + 1)];
    }
    return pages;
}

function applyStatusToMessageInPages(
    pages: ChatMessageWithDeliveryStatus[][],
    messageId: string,
    status: ChatMessageStatus,
): ChatMessageWithDeliveryStatus[][] {
    for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i];
        const idx = page.findIndex((msg) => msg.id === messageId);
        if (idx === -1) continue;
        const msg = page[idx];
        const updated: ChatMessageWithDeliveryStatus = { ...msg, status };
        const newPage = [...page];
        newPage[idx] = updated;
        return [...pages.slice(0, i), newPage, ...pages.slice(i + 1)];
    }
    return pages;
}

function replaceMessageInPages(
    pages: ChatMessageWithDeliveryStatus[][],
    messageId: string,
    updatedMessage: ChatMessageResponse,
): ChatMessageWithDeliveryStatus[][] {
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const idx = page.findIndex((msg) => msg.id === messageId);
        if (idx === -1) continue;
        const existing = page[idx];
        const merged: ChatMessageWithDeliveryStatus = {
            ...updatedMessage,
            is_first: existing.is_first ?? updatedMessage.is_first ?? false,
            delivery_status: existing.delivery_status ?? ChatMessageDeliveryStatus.Delivered,
        };
        const newPage = [...page];
        newPage[idx] = merged;
        return [...pages.slice(0, i), newPage, ...pages.slice(i + 1)];
    }
    return pages;
}

function sessionGeneratingKey(projectId: string, sessionId: string): string {
    return `${projectId}:${sessionId}`;
}

/** Call when the create-message POST succeeds so the UI shows generating/STOP/placeholder immediately. */
export function addSessionToGeneratingSet(
    queryClient: QueryClient,
    projectId: string,
    sessionId: string,
): void {
    const key = QueryKeys.chatSessionGeneratingSet();
    queryClient.setQueryData<Set<string>>(key, (prev) => {
        const next = new Set(prev ?? []);
        next.add(sessionGeneratingKey(projectId, sessionId));
        return next;
    });
}

/**
 * Handles chat session WS events from the user topic and updates the relevant
 * project/chat-session message cache. Uses project_id and session_id from
 * the event payload to route updates.
 */
export function handleChatSessionWsEvent(
    data: unknown,
    queryClient: QueryClient,
    lastAppliedChunkByMessageRef: { current: Map<string, number> },
): boolean {
    if (isChatSessionGenerationStartedEvent(data)) {
        const { project_id, session_id } = data;
        const key = QueryKeys.chatSessionGeneratingSet();
        queryClient.setQueryData<Set<string>>(key, (prev) => {
            const next = new Set(prev ?? []);
            next.add(sessionGeneratingKey(project_id, session_id));
            return next;
        });
        return true;
    }

    if (isChatSessionGenerationEndedEvent(data)) {
        const { project_id, session_id } = data;
        const key = QueryKeys.chatSessionGeneratingSet();
        queryClient.setQueryData<Set<string>>(key, (prev) => {
            const next = new Set(prev ?? []);
            next.delete(sessionGeneratingKey(project_id, session_id));
            return next;
        });
        return true;
    }

    if (isChatSessionMessageCreatedEvent(data)) {
        const { project_id, session_id, message } = data;
        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        const newMessage: ChatMessageWithDeliveryStatus = {
            ...message,
            is_first: message.is_first ?? false,
            delivery_status: ChatMessageDeliveryStatus.Delivered,
        };
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) => {
                if (pages.length === 0) return [[newMessage]];
                const lastPage = pages[pages.length - 1];
                if (lastPage.some((msg) => msg.id === message.id)) return pages;
                return [...pages.slice(0, -1), [...lastPage, newMessage]];
            }),
        );
        return true;
    }

    if (isChatSessionMessageUpdatedEvent(data)) {
        const { project_id, session_id, message } = data;
        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) =>
                replaceMessageInPages(pages, message.id, message),
            ),
        );
        return true;
    }

    if (isChatSessionMessageStatusChangeEvent(data)) {
        const { project_id, session_id, message_id, status } = data;
        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) =>
                applyStatusToMessageInPages(pages, message_id, status),
            ),
        );
        return true;
    }

    if (isChatSessionNewMessageChunkEvent(data)) {
        const { project_id, session_id, message_id, chunk_index, content, done } = data;
        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        const lastApplied = lastAppliedChunkByMessageRef.current.get(message_id) ?? NO_STREAM;

        if (chunk_index === 0) {
            if (lastApplied !== NO_STREAM) return true;
            lastAppliedChunkByMessageRef.current.set(message_id, 0);
            queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
                modifyInfiniteCacheData(old, (pages) =>
                    applyChunkToMessageInPages(pages, message_id, content, done),
                ),
            );
            if (done) lastAppliedChunkByMessageRef.current.delete(message_id);
            return true;
        }

        if (chunk_index !== lastApplied + 1) return true;
        lastAppliedChunkByMessageRef.current.set(message_id, chunk_index);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) =>
                applyChunkToMessageInPages(pages, message_id, content, done),
            ),
        );
        if (done) lastAppliedChunkByMessageRef.current.delete(message_id);
        return true;
    }

    return false;
}
