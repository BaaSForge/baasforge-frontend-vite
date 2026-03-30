import type { ChatMessageResponse } from "@/modules/project-chat/types";
import type { ProjectUnitResponse } from "@/modules/project/types";
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

export type ChatSessionNewThinkingChunkEvent = {
    type: "chat_session_new_thinking_chunk";
    project_id: string;
    session_id: string;
    message_id: string;
    chunk_index: number;
    thinking: string;
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

export type ProductionLiveReleaseChangedEvent = {
    type: "production_live_release_changed";
    project_id: string;
};

export type ProjectUnitWsEvent = {
    type: "project_unit_created" | "project_unit_modified" | "project_unit_deleted";
    project_id: string;
    session_id: string;
    unit: ProjectUnitResponse;
};

export type WsServerEvent =
    | ChatSessionNewMessageChunkEvent
    | ChatSessionNewThinkingChunkEvent
    | ChatSessionMessageCreatedEvent
    | ChatSessionMessageUpdatedEvent
    | ChatSessionMessageStatusChangeEvent
    | ChatSessionGenerationStartedEvent
    | ChatSessionGenerationEndedEvent
    | ProjectDeletedEvent
    | RuntimeCreatedEvent
    | ProductionLiveReleaseChangedEvent
    | ProjectUnitWsEvent
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

export function isProductionLiveReleaseChangedEvent(data: unknown): data is ProductionLiveReleaseChangedEvent {
    if (!isWsServerEvent(data)) return false;
    const t = data.type;
    if (t !== "production_live_release_changed") return false;
    return typeof (data as { project_id?: unknown }).project_id === "string";
}

function isRecord(data: unknown): data is Record<string, unknown> {
    return typeof data === "object" && data !== null;
}

function isProjectUnitEventType(type: unknown): type is ProjectUnitWsEvent["type"] {
    return (
        type === "project_unit_created" ||
        type === "project_unit_modified" ||
        type === "project_unit_deleted"
    );
}

export function isProjectUnitWsEvent(data: unknown): data is ProjectUnitWsEvent {
    if (!isRecord(data)) return false;
    if (!isProjectUnitEventType(data.type)) return false;
    const unit = data.unit;
    if (!isRecord(unit)) return false;
    return (
        typeof data.project_id === "string" &&
        typeof data.session_id === "string" &&
        typeof unit.context_slug === "string" &&
        typeof unit.module_slug === "string" &&
        typeof unit.unit_name_slug === "string"
    );
}

export function isChatSessionNewMessageChunkEvent(data: unknown): data is ChatSessionNewMessageChunkEvent {
    return isWsServerEvent(data) && data.type === "chat_session_new_message_chunk";
}

export function isChatSessionNewThinkingChunkEvent(data: unknown): data is ChatSessionNewThinkingChunkEvent {
    return isWsServerEvent(data) && data.type === "chat_session_new_thinking_chunk";
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
