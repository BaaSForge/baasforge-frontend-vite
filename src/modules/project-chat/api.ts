import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import { ChatMessageDeliveryStatus, type ChatMessageDTO, type ChatMessageResponse, type ChatMessageWithDeliveryStatus, type ChatSessionResponse } from "./types";

const chatSessionsEndpoint = (projectId: number) => `/v1/platform/projects/${projectId}/chat-sessions`
const chatSessionDetailEndpoint = (projectId: number, chatSessionId: number) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}`
const chatSessionMessagesEndpoint = (projectId: number, chatSessionId: number) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/messages`
// const chatSessionMessagesWebsocketEndpoint = (projectId: number, chatSessionId: number) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}/channel`

export function getProjectChatSessions(projectId: number): Promise<ChatSessionResponse[]> {
  return apiClient
    .get<ApiResponse<ChatSessionResponse[]>>(chatSessionsEndpoint(projectId))
    .then((res) => res.data ?? []);
}

export function createProjectChatSession(projectId: number): Promise<ChatSessionResponse | undefined> {
  return apiClient
    .post<ApiResponse<ChatSessionResponse>>(chatSessionsEndpoint(projectId))
    .then((res) => res.data);
}

export function getProjectChatSessionDetail(projectId: number, chatSessionId: number): Promise<ChatSessionResponse | undefined> {
  return apiClient
    .get<ApiResponse<ChatSessionResponse>>(chatSessionDetailEndpoint(projectId, chatSessionId))
    .then((res) => res.data);
}

export function getProjectChatSessionMessages(projectId: number, chatSessionId: number): Promise<ChatMessageWithDeliveryStatus[]> {
  return apiClient
    .get<ApiResponse<ChatMessageResponse[]>>(chatSessionMessagesEndpoint(projectId, chatSessionId))
    .then((res) => (res.data ?? []).map((message) => ({
      ...message,
      delivery_status: ChatMessageDeliveryStatus.Delivered,
    })));
}

export function createProjectChatSessionMessage(
  projectId: number,
  chatSessionId: number,
  message: ChatMessageDTO,
): Promise<ChatMessageWithDeliveryStatus | undefined> {
  const endpoint = chatSessionMessagesEndpoint(projectId, chatSessionId);

  return apiClient
    .post<ApiResponse<ChatMessageResponse>>(endpoint, message)
    .then((res) => res.data ? ({
      ...res.data,
      delivery_status: ChatMessageDeliveryStatus.Delivered,
    }) : undefined);
}