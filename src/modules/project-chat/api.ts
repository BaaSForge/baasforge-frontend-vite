import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import { ChatMessageDeliveryStatus, type ChatMessageDTO, type ChatMessageResponse, type ChatMessageWithDeliveryStatus, type ChatSessionResponse } from "./types";

const GET_MESSAGES_QUERY_LIMIT = 20;

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

export type ListChatMessagesParams = {
  before_id?: number;
};

export function getProjectChatSessionMessages(
  projectId: number,
  chatSessionId: number,
  params?: ListChatMessagesParams,
): Promise<ChatMessageWithDeliveryStatus[]> {
  const searchParams = new URLSearchParams();
  if (params?.before_id != null) {
    searchParams.set("before_id", String(params.before_id));
  }
  searchParams.set("limit", String(GET_MESSAGES_QUERY_LIMIT));
  const url = `${chatSessionMessagesEndpoint(projectId, chatSessionId)}?${searchParams.toString()}`;

  return apiClient
    .get<ApiResponse<ChatMessageResponse[]>>(url)
    .then((res) => (res.data ?? []).map((message) => ({
      ...message,
      delivery_status: ChatMessageDeliveryStatus.Delivered,
    })).reverse());
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