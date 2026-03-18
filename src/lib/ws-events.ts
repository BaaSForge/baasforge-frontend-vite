import type { ChatMessageResponse } from "@/modules/project-chat/types";
import { ChatMessageStatus } from "@/modules/project-chat/types";

export type ChatSessionNewMessageChunkEvent = {
    type: "chat_session_new_message_chunk";
    project_id: string;
    session_id: string;
    message_id: string;
    chunk_index: number;
    content: string;
    done: boolean;
};

export type ChatSessionMessageCreatedEvent = {
    type: "chat_session_message_created";
    project_id: string;
    session_id: string;
    message: ChatMessageResponse;
};

export type ChatSessionMessageUpdatedEvent = {
    type: "chat_session_message_updated";
    project_id: string;
    session_id: string;
    message: ChatMessageResponse;
};

/** Payload when a message's status changes (e.g. to `failed` or `stopped`). */
export type ChatSessionMessageStatusChangeEvent = {
    type: "chat_session_message_status_change";
    project_id: string;
    session_id: string;
    message_id: string;
    status: ChatMessageStatus;
};

export type ChatSessionGenerationStartedEvent = {
    type: "chat_session_generation_started";
    project_id: string;
    session_id: string;
};

export type ChatSessionGenerationEndedEvent = {
    type: "chat_session_generation_ended";
    project_id: string;
    session_id: string;
};

export type ProjectDeletedEvent = {
    type: "project_deleted";
    project_id: string;
};

export type RuntimeCreatedEvent = {
    type: "runtime_created";
    project_id: string;
    runtime_id: string;
};

export type WsServerEvent =
    | ChatSessionNewMessageChunkEvent
    | ChatSessionMessageCreatedEvent
    | ChatSessionMessageUpdatedEvent
    | ChatSessionMessageStatusChangeEvent
    | ChatSessionGenerationStartedEvent
    | ChatSessionGenerationEndedEvent
    | ProjectDeletedEvent
    | RuntimeCreatedEvent
    | { type: "subscribed"; topic: string }
    | { type: "unsubscribed"; topic: string }
    | { type: "error"; message: string };

export function isWsServerEvent(data: unknown): data is WsServerEvent {
    return typeof data === "object" && data !== null && "type" in data && typeof (data as { type?: unknown }).type === "string";
}

export function isProjectDeletedEvent(data: unknown): data is ProjectDeletedEvent {
    return isWsServerEvent(data) && data.type === "project_deleted";
}

export function isRuntimeCreatedEvent(data: unknown): data is RuntimeCreatedEvent {
    return isWsServerEvent(data) && data.type === "runtime_created";
}

export function isChatSessionNewMessageChunkEvent(data: unknown): data is ChatSessionNewMessageChunkEvent {
    return isWsServerEvent(data) && data.type === "chat_session_new_message_chunk";
}

export function isChatSessionMessageCreatedEvent(data: unknown): data is ChatSessionMessageCreatedEvent {
    return isWsServerEvent(data) && data.type === "chat_session_message_created";
}

export function isChatSessionMessageUpdatedEvent(data: unknown): data is ChatSessionMessageUpdatedEvent {
    return isWsServerEvent(data) && data.type === "chat_session_message_updated";
}

export function isChatSessionMessageStatusChangeEvent(data: unknown): data is ChatSessionMessageStatusChangeEvent {
    return isWsServerEvent(data) && data.type === "chat_session_message_status_change";
}

export function isChatSessionGenerationStartedEvent(data: unknown): data is ChatSessionGenerationStartedEvent {
    return isWsServerEvent(data) && data.type === "chat_session_generation_started";
}

export function isChatSessionGenerationEndedEvent(data: unknown): data is ChatSessionGenerationEndedEvent {
    return isWsServerEvent(data) && data.type === "chat_session_generation_ended";
}

export function userTopic(userId: string): string {
    return `user:${userId}`;
}
