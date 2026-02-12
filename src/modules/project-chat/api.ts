import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { ChatSessionResponse } from "./types";

const chatSessionsEndpoint = (projectId: number) => `/v1/platform/projects/${projectId}/chat-sessions`

export function getProjectChatSessions(projectId: number): Promise<ChatSessionResponse[]> {
  return apiClient
    .get<ApiResponse<ChatSessionResponse[]>>(chatSessionsEndpoint(projectId))
    .then((res) => res.data ?? []);
}