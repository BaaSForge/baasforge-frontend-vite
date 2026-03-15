export interface ChatSessionResponse {
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    created_at: string;
    stage_project_runtime_id?: string | null;
}

export enum ChatSessionRoleType {
    User = "user",
    Ai = "ai",
}

export enum ChatMessageType {
    Text = "text",
    ToolFetchRelevantUnits = "tool_fetch_relevant_units",
    Units = "units",
    Unit = "unit",
    Generating = "generating",
    GeneratingFailed = "generating_failed",
    GeneratingSucceed = "generating_succeed",
}

export enum ChatMessageStatus {
    Generating = "generating",
    Failed = "failed",
    Stopped = "stopped",
    Completed = "completed",
}

export type { ToolFetchRelevantUnitsArgs, ToolFetchRelevantUnitsPayload } from "./payloads";

export interface ChatMessageResponse {
    id: string;
    chat_session_id: string;
    role: ChatSessionRoleType;
    type: ChatMessageType;
    payload?: unknown | null;
    created_at: string;
    is_first: boolean;
    status: ChatMessageStatus;
}

export interface CreateChatMessageApiResponse extends ChatMessageResponse {
    placeholder_message: ChatMessageResponse;
}

export interface ChatMessageDTO {
    type: ChatMessageType;
    payload?: unknown | null;
}

export enum ChatMessageDeliveryStatus {
    Pending = "pending",
    Failed = "failed",
    Delivered = "delivered",
}

export interface ChatMessageWithDeliveryStatus extends ChatMessageResponse {
    delivery_status: ChatMessageDeliveryStatus;
    is_optimistic?: boolean;
}

export type CreateProjectChatSessionMessageMutationParams = {
    projectId: string;
    chatSessionId: string;
    optimisticMessage: ChatMessageWithDeliveryStatus;
};
