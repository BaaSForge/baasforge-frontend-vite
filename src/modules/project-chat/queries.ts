import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getProjectChatSessionDetail, getProjectChatSessions } from "./api";

export function useProjectChatSessionsQuery(projectId?: number) {
  return useQuery({
    enabled: !!projectId,
    queryKey: QueryKeys.projectChatSessionList(projectId ?? 0),
    queryFn: () => getProjectChatSessions(projectId ?? 0),
  });
}

export function useProjectChatSessionDetailQuery(projectId?: number, chatSessionId?: number) {
  return useQuery({
    enabled: !!projectId && !!chatSessionId,
    queryKey: QueryKeys.projectChatSessionDetail(projectId ?? 0, chatSessionId ?? 0),
    queryFn: () => getProjectChatSessionDetail(projectId ?? 0, chatSessionId ?? 0),
  });
}