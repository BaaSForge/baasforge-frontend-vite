import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type { ProjectUnitResponse } from "@/modules/project/types";
import {
    ChatMessageDeliveryStatus,
    type ChatMessageDTO,
    type ChatMessageResponse,
    type ChatMessageWithDeliveryStatus,
    type ChatSessionResponse,
} from "./types";

const GET_MESSAGES_QUERY_LIMIT = 20;

const chatSessionsEndpoint = (projectId: string) => `/v1/platform/projects/${projectId}/chat-sessions`;
const chatSessionDetailEndpoint = (projectId: string, chatSessionId: string) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}`;
const chatSessionMessagesEndpoint = (projectId: string, chatSessionId: string) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/messages`;
const chatSessionStopEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/stop-generating`;
const chatSessionUnitByIdsEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/units-by-ids`;
// const chatSessionMessagesWebsocketEndpoint = (projectId: number, chatSessionId: number) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/channel`

export type ChatSessionUnitByIdsRequestBody = {
    unit_ids: string[];
};

export type ChatSessionUnitByIdsData = {
    units: ProjectUnitResponse[];
};

export function getProjectChatSessions(projectId: string): Promise<ChatSessionResponse[]> {
    return apiClient.get<ApiResponse<ChatSessionResponse[]>>(chatSessionsEndpoint(projectId)).then((res) => res.data ?? []);
}

export function createProjectChatSession(projectId: string, title: string): Promise<ChatSessionResponse | undefined> {
    return apiClient.post<ApiResponse<ChatSessionResponse>>(chatSessionsEndpoint(projectId), { title }).then((res) => res.data);
}

export function getProjectChatSessionDetail(projectId: string, chatSessionId: string): Promise<ChatSessionResponse | undefined> {
    return apiClient.get<ApiResponse<ChatSessionResponse>>(chatSessionDetailEndpoint(projectId, chatSessionId)).then((res) => res.data);
}

export type ListChatMessagesParams = {
    before_id?: string;
};

export function getProjectChatSessionMessages(
    projectId: string,
    chatSessionId: string,
    params?: ListChatMessagesParams,
): Promise<ChatMessageWithDeliveryStatus[]> {
    const searchParams = new URLSearchParams();
    if (params?.before_id != null) {
        searchParams.set("before_id", params.before_id);
    }
    searchParams.set("limit", String(GET_MESSAGES_QUERY_LIMIT));
    const url = `${chatSessionMessagesEndpoint(projectId, chatSessionId)}?${searchParams.toString()}`;

    return apiClient.get<ApiResponse<ChatMessageResponse[]>>(url).then((res) =>
        (res.data ?? [])
            .map((message) => ({
                ...message,
                delivery_status: ChatMessageDeliveryStatus.Delivered,
            }))
            .reverse(),
    );
}

export type CreateProjectChatSessionMessageResult = {
    saved: ChatMessageWithDeliveryStatus;
};

export function createProjectChatSessionMessage(
    projectId: string,
    chatSessionId: string,
    message: ChatMessageDTO,
): Promise<CreateProjectChatSessionMessageResult | undefined> {
    const endpoint = chatSessionMessagesEndpoint(projectId, chatSessionId);

    return apiClient.post<ApiResponse<ChatMessageResponse>>(endpoint, message).then((res) => {
        if (!res.data) return undefined;
        const userMessage = res.data;
        const saved: ChatMessageWithDeliveryStatus = {
            ...userMessage,
            delivery_status: ChatMessageDeliveryStatus.Delivered,
        };
        return { saved };
    });
}

export type StopProjectChatSessionResponse = {
    stopped_message_ids: string[];
};

export function stopProjectChatSession(projectId: string, chatSessionId: string): Promise<StopProjectChatSessionResponse | undefined> {
    return apiClient.post<ApiResponse<StopProjectChatSessionResponse>>(chatSessionStopEndpoint(projectId, chatSessionId)).then((res) => res.data);
}

export function getChatSessionUnitsByIds(
    projectId: string,
    chatSessionId: string,
    unitIds: string[],
): Promise<ProjectUnitResponse[]> {
    if (unitIds.length === 0) {
        return Promise.resolve([]);
    }
    const body: ChatSessionUnitByIdsRequestBody = { unit_ids: unitIds };
    return apiClient
        .post<ApiResponse<ChatSessionUnitByIdsData>>(chatSessionUnitByIdsEndpoint(projectId, chatSessionId), body)
        .then((res) => res.data?.units ?? []);
}
