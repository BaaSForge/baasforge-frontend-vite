import { QueryKeys } from "@/constants/query-keys";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProjectChatSessionDetail, getProjectChatSessionMessages, getProjectChatSessions } from "./api";
import type { ChatMessageWithDeliveryStatus } from "./types";

export function useProjectChatSessionsQuery(projectId?: string) {
    return useQuery({
        enabled: !!projectId,
        queryKey: QueryKeys.projectChatSessionList(projectId ?? ""),
        queryFn: () => getProjectChatSessions(projectId ?? ""),
    });
}

export function useProjectChatSessionDetailQuery(projectId?: string, chatSessionId?: string) {
    return useQuery({
        enabled: !!projectId && !!chatSessionId,
        queryKey: QueryKeys.projectChatSessionDetail(projectId ?? "", chatSessionId ?? ""),
        queryFn: () => getProjectChatSessionDetail(projectId ?? "", chatSessionId ?? ""),
    });
}

export function useProjectChatSessionMessagesQuery(projectId?: string, chatSessionId?: string) {
    return useInfiniteQuery({
        enabled: !!projectId && !!chatSessionId,
        queryKey: QueryKeys.projectChatSessionMessages(projectId ?? "", chatSessionId ?? ""),
        queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
            getProjectChatSessionMessages(projectId ?? "", chatSessionId ?? "", {
                before_id: pageParam,
            }),
        initialPageParam: undefined as string | undefined,
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
