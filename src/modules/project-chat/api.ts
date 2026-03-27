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

const GET_MESSAGES_QUERY_LIMIT = 100;

const chatSessionsEndpoint = (projectId: string) => `/v1/platform/projects/${projectId}/chat-sessions`;
const chatSessionDetailEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}`;
const chatSessionMessagesEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/messages`;
const chatSessionStopEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/stop-generating`;
const chatSessionUnitLatestRevisionsByIdsEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/unit-latest-revisions-by-ids`;
const chatSessionUnitPreChatBaseByPathsEndpoint = (projectId: string, chatSessionId: string) =>
    `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/unit-pre-chat-base-by-paths`;

/** Matches backend `UnitPathsBody`: each string is the unit path (full id without the trailing `.<revision>` segment). */
export type UnitPathsBody = {
    unit_paths: string[];
};

/** Same length and order as request `unit_paths`; `null` when no unit exists for that path in this session. */
export type UnitLatestRevisionsResponse = {
    revisions: (number | null)[];
};

/** Same length and order as request `unit_paths`; `null` when there is no pre-chat base revision for that path. */
export type UnitPreChatBaseByPathsResponse = {
    units: (ProjectUnitResponse | null)[];
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

/**
 * Resolves largest revision per unit path in this chat session.
 * Pass unit paths (omit trailing `.<revision>`); order matches `revisions` in the response.
 */
export function postChatSessionUnitLatestRevisionsByIds(
    projectId: string,
    chatSessionId: string,
    unitPaths: string[],
): Promise<UnitLatestRevisionsResponse> {
    if (unitPaths.length === 0) {
        return Promise.resolve({ revisions: [] });
    }
    const body: UnitPathsBody = { unit_paths: unitPaths };
    return apiClient
        .post<ApiResponse<UnitLatestRevisionsResponse>>(chatSessionUnitLatestRevisionsByIdsEndpoint(projectId, chatSessionId), body)
        .then((res) => res.data ?? { revisions: [] });
}

/**
 * For each unit path, returns the unit row at revision `MIN(revision) - 1` in this session (state before the first in-session revision).
 */
export function postChatSessionUnitPreChatBaseByPaths(
    projectId: string,
    chatSessionId: string,
    unitPaths: string[],
): Promise<UnitPreChatBaseByPathsResponse> {
    if (unitPaths.length === 0) {
        return Promise.resolve({ units: [] });
    }
    const body: UnitPathsBody = { unit_paths: unitPaths };
    return apiClient
        .post<ApiResponse<UnitPreChatBaseByPathsResponse>>(chatSessionUnitPreChatBaseByPathsEndpoint(projectId, chatSessionId), body)
        .then((res) => res.data ?? { units: [] });
}
