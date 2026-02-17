import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { createProjectChatSession, createProjectChatSessionMessage } from "./api";
import type { ChatMessageDTO, ChatMessageWithDeliveryStatus, CreateProjectChatSessionMessageMutationParams } from "./types";
import { ChatMessageDeliveryStatus } from "./types";

export function useCreateProjectChatSessionMutation(projectId: number) {
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

      queryClient.setQueryData<ChatMessageWithDeliveryStatus[]>(cacheKey, (old = []) => {
        const currentOptimisticMessage = old.find((msg) => msg.id === optimisticMessage.id);

        if (currentOptimisticMessage) {
          return old.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, delivery_status: ChatMessageDeliveryStatus.Pending }
              : msg
          );
        }

        return [
          optimisticMessage,
          ...old,
        ];
      });

      function setFailed() {
        queryClient.setQueryData<ChatMessageWithDeliveryStatus[]>(cacheKey, (old = []) => {
          return old.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, delivery_status: ChatMessageDeliveryStatus.Failed }
              : msg
          );
        });
      }

      function setDelivered(saved: ChatMessageWithDeliveryStatus) {
        queryClient.setQueryData<ChatMessageWithDeliveryStatus[]>(cacheKey, (old = []) => {
          return [
            { ...saved, delivery_status: ChatMessageDeliveryStatus.Delivered },
            ...old.filter((msg) => msg.id !== optimisticMessage.id),
          ];
        });
      }

      try {
        const message: ChatMessageDTO = {
          type: optimisticMessage.type,
          payload: optimisticMessage.payload,
        };
        const saved = await createProjectChatSessionMessage(projectId, chatSessionId, message);

        if (saved) {
          setDelivered(saved);
          return saved;
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
