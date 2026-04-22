import type { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { invalidateLastNotDisabledReleaseControllerMessageQueries } from "@/modules/project/invalidate-project-queries";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import {
    isChatSessionGenerationEndedEvent,
    isChatSessionGenerationStartedEvent,
    isChatSessionMessageCreatedEvent,
    isChatSessionMessageStatusChangeEvent,
    isChatSessionMessageUpdatedEvent,
    isChatSessionNewMessageChunkEvent,
    isChatSessionNewThinkingChunkEvent,
    isProjectUnitWsEvent,
} from "@/lib/ws-events";
import { mergeChatSessionUnitLatestRevisionFromWsUnit } from "@/modules/project/chat-session-unit-latest-revisions-cache";
import type { ProjectUnitResponse } from "@/modules/project/types";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatMessageType,
    ChatSessionRoleType,
    type ChatMessageResponse,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
    type ThinkingBlock,
} from "@/modules/project-chat/types";
import type { InfiniteData } from "@tanstack/react-query";

/**
 * Updates project chat-session caches from WebSocket events.
 *
 * Flow:
 * 1. handleChatSessionWsEvent receives raw WS data and dispatches by event type.
 * 2. Each branch updates either the "generating" set (which sessions are streaming)
 *    or the infinite-query messages cache for that project/session.
 * 3. Message cache is updated via pure helpers that take (pages, ...) and return
 *    new pages (or the same reference if nothing changed).
 *
 * Note: status_change can arrive before message_created; we then add a minimal
 * message and message_created later replaces it (we keep failed/stopped when merging).
 */

const NO_STREAM = -1 as const;

type Pages = ChatMessageWithDeliveryStatus[][];

function sessionKey(projectId: string, sessionId: string): string {
    return `${projectId}:${sessionId}`;
}

/** Single place to add/remove a session from the "currently generating" set. */
function setSessionGenerating(
    queryClient: QueryClient,
    projectId: string,
    sessionId: string,
    generating: boolean,
): void {
    const key = QueryKeys.chatSessionGeneratingSet();
    queryClient.setQueryData<Set<string>>(key, (prev) => {
        const next = new Set(prev ?? []);
        if (generating) next.add(sessionKey(projectId, sessionId));
        else next.delete(sessionKey(projectId, sessionId));
        return next;
    });
}

/** Get plain text from a message (handles string payload or TextMessagePayload). */
function getMessageText(msg: ChatMessageWithDeliveryStatus): string {
    if (typeof msg.payload === "string") return msg.payload;
    if (msg.payload != null && typeof msg.payload === "object" && "text" in msg.payload) {
        return (msg.payload as TextMessagePayload).text ?? "";
    }
    return "";
}

/** Return same message with payload text appended and status set (for streaming). */
function messageWithChunkApplied(
    msg: ChatMessageWithDeliveryStatus,
    content: string,
    done: boolean,
): ChatMessageWithDeliveryStatus {
    const currentText = getMessageText(msg);
    const payload: TextMessagePayload =
        msg.payload != null && typeof msg.payload === "object" && !Array.isArray(msg.payload) && "text" in msg.payload
            ? { ...(msg.payload as TextMessagePayload), text: currentText + content }
            : { text: currentText + content };
    return {
        ...msg,
        payload,
        status: done ? ChatMessageStatus.Completed : ChatMessageStatus.Generating,
    };
}

/** Find a message by id in pages. fromEnd = true searches last page first (for stream updates). */
function findInPages(
    pages: Pages,
    messageId: string,
    fromEnd: boolean,
): { pageIndex: number; messageIndex: number; message: ChatMessageWithDeliveryStatus } | null {
    const order = fromEnd ? [...Array(pages.length).keys()].reverse() : [...Array(pages.length).keys()];
    for (const i of order) {
        const idx = pages[i].findIndex((m) => m.id === messageId);
        if (idx !== -1) return { pageIndex: i, messageIndex: idx, message: pages[i][idx]! };
    }
    return null;
}

/** Return new pages with the message at (pageIndex, messageIndex) replaced. */
function replaceAt(
    pages: Pages,
    pageIndex: number,
    messageIndex: number,
    newMessage: ChatMessageWithDeliveryStatus,
): Pages {
    const page = pages[pageIndex]!;
    const newPage = [...page];
    newPage[messageIndex] = newMessage;
    return [...pages.slice(0, pageIndex), newPage, ...pages.slice(pageIndex + 1)];
}

function applyChunkToMessageInPages(
    pages: Pages,
    messageId: string,
    content: string,
    done: boolean,
): Pages {
    const found = findInPages(pages, messageId, true);
    if (!found) return pages;
    return replaceAt(pages, found.pageIndex, found.messageIndex, messageWithChunkApplied(found.message, content, done));
}

/** Append streamed thinking into the first `ThinkingBlock` (matches typical single-block streaming). */
function messageWithThinkingChunkApplied(
    msg: ChatMessageWithDeliveryStatus,
    thinkingChunk: string,
): ChatMessageWithDeliveryStatus {
    const payload = msg.payload;
    const base: TextMessagePayload =
        payload != null && typeof payload === "object" && !Array.isArray(payload) && "text" in payload
            ? { ...(payload as TextMessagePayload) }
            : { text: getMessageText(msg) };
    const existingBlocks = base.thinking_blocks;
    const firstBlock = existingBlocks?.[0];
    const rest = existingBlocks?.slice(1) ?? [];
    const prevThinking = firstBlock?.thinking ?? "";
    const mergedFirst: ThinkingBlock = {
        thinking: prevThinking + thinkingChunk,
        ...(firstBlock?.signature != null && firstBlock.signature !== ""
            ? { signature: firstBlock.signature }
            : {}),
    };
    const newBlocks: ThinkingBlock[] = [mergedFirst, ...rest];
    return {
        ...msg,
        payload: { ...base, thinking_blocks: newBlocks },
    };
}

function applyThinkingChunkToMessageInPages(pages: Pages, messageId: string, thinkingChunk: string): Pages {
    const found = findInPages(pages, messageId, true);
    if (!found) return pages;
    return replaceAt(
        pages,
        found.pageIndex,
        found.messageIndex,
        messageWithThinkingChunkApplied(found.message, thinkingChunk),
    );
}

function applyStatusToMessageInPages(pages: Pages, messageId: string, status: ChatMessageStatus): Pages {
    const found = findInPages(pages, messageId, true);
    if (!found) return pages;
    return replaceAt(pages, found.pageIndex, found.messageIndex, { ...found.message, status });
}

function replaceMessageInPages(
    pages: Pages,
    messageId: string,
    updatedMessage: ChatMessageResponse,
): Pages {
    const found = findInPages(pages, messageId, false);
    if (!found) return pages;
    const existing = found.message;
    const preserveStatus = existing.status === ChatMessageStatus.Failed || existing.status === ChatMessageStatus.Stopped;
    const merged: ChatMessageWithDeliveryStatus = {
        ...updatedMessage,
        status: preserveStatus ? existing.status : updatedMessage.status,
        is_first: existing.is_first ?? updatedMessage.is_first ?? false,
        delivery_status: existing.delivery_status ?? ChatMessageDeliveryStatus.Delivered,
    };
    return replaceAt(pages, found.pageIndex, found.messageIndex, merged);
}

function appendMessageToPages(pages: Pages, message: ChatMessageWithDeliveryStatus): Pages {
    if (pages.length === 0) return [[message]];
    const lastPage = pages[pages.length - 1]!;
    if (lastPage.some((m) => m.id === message.id)) return pages;
    return [...pages.slice(0, -1), [...lastPage, message]];
}

function placeholderMessage(sessionId: string, messageId: string, status: ChatMessageStatus): ChatMessageWithDeliveryStatus {
    return {
        id: messageId,
        chat_session_id: sessionId,
        role: ChatSessionRoleType.Ai,
        type: ChatMessageType.Text,
        payload: { text: "" },
        created_at: new Date().toISOString(),
        is_first: false,
        status,
        delivery_status: ChatMessageDeliveryStatus.Delivered,
    };
}

function sameProjectUnitIdentity(a: ProjectUnitResponse, b: ProjectUnitResponse): boolean {
    return (
        a.context_slug === b.context_slug &&
        a.module_slug === b.module_slug &&
        a.unit_name_slug === b.unit_name_slug
    );
}

function upsertDraftUnitInList(prev: ProjectUnitResponse[] | undefined, unit: ProjectUnitResponse): ProjectUnitResponse[] {
    const without = (prev ?? []).filter((u) => !sameProjectUnitIdentity(u, unit));
    return [unit, ...without];
}

export function handleProjectUnitWsEvent(data: unknown, queryClient: QueryClient): boolean {
    if (!isProjectUnitWsEvent(data)) return false;

    const { project_id, session_id, unit } = data;
    if (unit.project_id !== project_id) return true;
    if (unit.chat_session_id != null && unit.chat_session_id !== session_id) return true;

    const cacheKey = QueryKeys.projectDraftUnits(project_id, session_id);
    queryClient.setQueryData<ProjectUnitResponse[]>(cacheKey, (old) => upsertDraftUnitInList(old, unit));
    mergeChatSessionUnitLatestRevisionFromWsUnit(queryClient, project_id, session_id, unit);
    return true;
}

/** Call when the create-message POST succeeds so the UI shows generating/STOP/placeholder immediately. */
export function addSessionToGeneratingSet(
    queryClient: QueryClient,
    projectId: string,
    sessionId: string,
): void {
    setSessionGenerating(queryClient, projectId, sessionId, true);
}

export type ChatSessionWsChunkTracking = {
    /** Last applied `chat_session_new_message_chunk` index per message id. */
    messageChunks: Map<string, number>;
    /** Last applied `chat_session_new_thinking_chunk` index per message id. */
    thinkingChunks: Map<string, number>;
};

/**
 * Handles chat session WS events from the user topic and updates the relevant
 * project/chat-session message cache. Uses project_id and session_id from
 * the event payload to route updates.
 */
export function handleChatSessionWsEvent(
    data: unknown,
    queryClient: QueryClient,
    chunkTracking: ChatSessionWsChunkTracking,
): boolean {
    if (isChatSessionGenerationStartedEvent(data)) {
        setSessionGenerating(queryClient, data.project_id, data.session_id, true);
        return true;
    }
    if (isChatSessionGenerationEndedEvent(data)) {
        setSessionGenerating(queryClient, data.project_id, data.session_id, false);
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
                const replaced = replaceMessageInPages(pages, message.id, message);
                if (replaced !== pages) return replaced;
                return appendMessageToPages(pages, newMessage);
            }),
        );
        if (message.type === ChatMessageType.ReleaseControllerBox) {
            void invalidateLastNotDisabledReleaseControllerMessageQueries(queryClient, project_id);
        }
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
        if (message.type === ChatMessageType.ReleaseControllerBox) {
            void invalidateLastNotDisabledReleaseControllerMessageQueries(queryClient, project_id);
        }
        return true;
    }

    if (isChatSessionMessageStatusChangeEvent(data)) {
        const { project_id, session_id, message_id, status } = data;
        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) => {
                const updated = applyStatusToMessageInPages(pages, message_id, status);
                if (updated !== pages) return updated;
                return appendMessageToPages(pages, placeholderMessage(session_id, message_id, status));
            }),
        );
        return true;
    }

    if (isChatSessionNewMessageChunkEvent(data)) {
        const { project_id, session_id, message_id, chunk_index, content, done } = data;
        const lastApplied = chunkTracking.messageChunks.get(message_id) ?? NO_STREAM;
        const acceptChunk =
            chunk_index === 0 ? lastApplied === NO_STREAM : chunk_index === lastApplied + 1;
        if (!acceptChunk) return true;

        chunkTracking.messageChunks.set(message_id, chunk_index);
        if (done) chunkTracking.messageChunks.delete(message_id);

        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) =>
                applyChunkToMessageInPages(pages, message_id, content, done),
            ),
        );
        return true;
    }

    if (isChatSessionNewThinkingChunkEvent(data)) {
        const { project_id, session_id, message_id, chunk_index, thinking, done } = data;
        const lastApplied = chunkTracking.thinkingChunks.get(message_id) ?? NO_STREAM;
        const acceptChunk =
            chunk_index === 0 ? lastApplied === NO_STREAM : chunk_index === lastApplied + 1;
        if (!acceptChunk) return true;

        chunkTracking.thinkingChunks.set(message_id, chunk_index);
        if (done) chunkTracking.thinkingChunks.delete(message_id);

        const cacheKey = QueryKeys.projectChatSessionMessages(project_id, session_id);
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
            modifyInfiniteCacheData(old, (pages) =>
                applyThinkingChunkToMessageInPages(pages, message_id, thinking),
            ),
        );
        return true;
    }

    return false;
}
