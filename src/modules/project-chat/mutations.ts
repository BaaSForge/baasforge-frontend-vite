import { QueryKeys } from "@/constants/query-keys";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectChatSession, createProjectChatSessionMessage } from "./api";
import type { ChatMessageDTO, ChatMessageWithDeliveryStatus, CreateProjectChatSessionMessageMutationParams } from "./types";
import { ChatMessageDeliveryStatus } from "./types";

export function useCreateProjectChatSessionMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => createProjectChatSession(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
        },
    });
}

export function useCreateProjectChatSessionMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, chatSessionId, optimisticMessage }: CreateProjectChatSessionMessageMutationParams) => {
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
                const result = await createProjectChatSessionMessage(projectId, chatSessionId, message);

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
