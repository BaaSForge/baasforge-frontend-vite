import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getProjectChatSessions } from "./api";

export function useProjectChatSessionsQuery(projectId: number) {
  return useQuery({
    enabled: !!projectId,
    queryKey: QueryKeys.projectChatSessionList(projectId),
    queryFn: () => getProjectChatSessions(projectId),
  });
}