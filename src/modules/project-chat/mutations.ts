import { QueryKeys } from "@/constants/query-keys";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import {
    invalidateDueToRejectOrEdit,
    removeProjectDraftUnitsAsOfReleaseControllerQueries,
} from "@/modules/project/invalidate-project-queries";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectChatSession, createProjectChatSessionMessage, postRetryFailedPlannerMessage } from "./api";
import {
    collectReleaseControllerMessageIdsRemovedAfterMessage,
    trimInfiniteMessagesCacheRemovingMessagesAfter,
} from "./trim-messages-cache";
import type { ChatMessageDTO, ChatMessageWithDeliveryStatus, CreateProjectChatSessionMessageMutationParams } from "./types";
import { ChatMessageDeliveryStatus } from "./types";

export function useCreateProjectChatSessionMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title: string) => createProjectChatSession(projectId, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
        },
    });
}

export function useCreateProjectChatSessionMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, chatSessionId, optimisticMessage, debugContext }: CreateProjectChatSessionMessageMutationParams) => {
            const cacheKey = QueryKeys.projectChatSessionMessages(projectId, chatSessionId);

            queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) => {
                return modifyInfiniteCacheData(old, (pages) => {
                    if (pages.length === 0) {
                        return [[optimisticMessage]];
                    }
                    const lastPage = pages[pages.length - 1];
                    const existing = lastPage.find((msg) => msg.id === optimisticMessage.id);
                    if (existing) {
                        return [
                            ...pages.slice(0, -1),
                            lastPage.map((msg) => (msg.id === optimisticMessage.id ? { ...msg, delivery_status: ChatMessageDeliveryStatus.Pending } : msg)),
                        ];
                    }
                    return [...pages.slice(0, -1), [...lastPage, optimisticMessage]];
                });
            });

            function setFailed() {
                queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) => {
                    return modifyInfiniteCacheData(old, (pages) => {
                        const lastPage = pages[pages.length - 1];
                        return [
                            ...pages.slice(0, -1),
                            lastPage.map((msg) => (msg.id === optimisticMessage.id ? { ...msg, delivery_status: ChatMessageDeliveryStatus.Failed } : msg)),
                        ];
                    });
                });
            }

            function setDelivered(saved: ChatMessageWithDeliveryStatus) {
                queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) => {
                    return modifyInfiniteCacheData(old, (pages) => {
                        const lastPage = pages[pages.length - 1];
                        const delivered = { ...saved, delivery_status: ChatMessageDeliveryStatus.Delivered };
                        // Replace optimistic message in place so it stays before any WebSocket messages that arrived in the meantime
                        const idx = lastPage.findIndex((msg) => msg.id === optimisticMessage.id);
                        const newLastPage =
                            idx >= 0
                                ? lastPage.map((msg) => (msg.id === optimisticMessage.id ? delivered : msg))
                                : [...lastPage, delivered];
                        return [...pages.slice(0, -1), newLastPage];
                    });
                });
            }

            try {
                const message: ChatMessageDTO = {
                    type: optimisticMessage.type,
                    payload: optimisticMessage.payload,
                };
                const result = await createProjectChatSessionMessage(projectId, chatSessionId, message, debugContext);

                if (result) {
                    setDelivered(result.saved);
                    return result.saved;
                } else {
                    setFailed();
                    return undefined;
                }
            } catch (e) {
                setFailed();
                throw e;
            }
        },
    });
}

export type RetryFailedPlannerMessageParams = {
    projectId: string;
    chatSessionId: string;
    messageId: string;
};

export function useRetryFailedPlannerMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, chatSessionId, messageId }: RetryFailedPlannerMessageParams) =>
            postRetryFailedPlannerMessage(projectId, chatSessionId, messageId),
        onMutate: async ({ projectId, chatSessionId, messageId }) => {
            const messagesKey = QueryKeys.projectChatSessionMessages(projectId, chatSessionId);
            const messagesBeforeTrim = queryClient.getQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(messagesKey);
            const removedReleaseControllerIds = collectReleaseControllerMessageIdsRemovedAfterMessage(
                messagesBeforeTrim,
                messageId,
            );
            removeProjectDraftUnitsAsOfReleaseControllerQueries(
                queryClient,
                projectId,
                chatSessionId,
                removedReleaseControllerIds,
            );
            queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(
                messagesKey,
                (old) => trimInfiniteMessagesCacheRemovingMessagesAfter(old, messageId) ?? old,
            );
            return { messagesBeforeTrim, messagesKey };
        },
        onSuccess: async (_, { projectId, chatSessionId }) => {
            await invalidateDueToRejectOrEdit(queryClient, projectId, chatSessionId);
        },
        onError: (_err, _vars, context) => {
            if (context?.messagesBeforeTrim != null && context.messagesKey != null) {
                queryClient.setQueryData(context.messagesKey, context.messagesBeforeTrim);
            }
        },
    });
}
