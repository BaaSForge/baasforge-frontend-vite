import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getProjectChatSessionDetail, getProjectChatSessionMessages, getProjectChatSessions } from "./api";
import type { ChatMessageWithDeliveryStatus } from "./types";

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

export function useProjectChatSessionMessagesQuery(projectId?: number, chatSessionId?: number) {
  return useInfiniteQuery({
    enabled: !!projectId && !!chatSessionId,
    queryKey: QueryKeys.projectChatSessionMessages(projectId ?? 0, chatSessionId ?? 0),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getProjectChatSessionMessages(projectId ?? 0, chatSessionId ?? 0, {
        before_id: pageParam,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage: ChatMessageWithDeliveryStatus[]) => {
      if (firstPage.length === 0) {
        return undefined;
      }

      const firstMessage = firstPage[0];

      // Skip page load if the first message is optimistic, which means chat has been created just now
      // or if it is the real first message
      if (firstMessage?.is_optimistic === true || firstMessage?.is_first === true) {
        return undefined;
      }

      return firstMessage.id;
    },
  });
}