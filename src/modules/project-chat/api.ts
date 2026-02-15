import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { ChatSessionResponse } from "./types";

const chatSessionsEndpoint = (projectId: number) => `/v1/platform/projects/${projectId}/chat-sessions`
const chatSessionEndpoint = (projectId: number, chatSessionId: number) => `/v1/platform/projects/${projectId}/chat-sessions/${chatSessionId}`

export function getProjectChatSessions(projectId: number): Promise<ChatSessionResponse[]> {
  return apiClient
    .get<ApiResponse<ChatSessionResponse[]>>(chatSessionsEndpoint(projectId))
    .then((res) => res.data ?? []);
}

export function getProjectChatSessionDetail(projectId: number, chatSessionId: number): Promise<ChatSessionResponse | undefined> {
  return apiClient
    .get<ApiResponse<ChatSessionResponse>>(chatSessionEndpoint(projectId, chatSessionId))
    .then((res) => res.data);
}