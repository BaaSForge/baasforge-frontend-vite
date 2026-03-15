"use client";

import { createStore } from "zustand";

type PendingState =
    | null
    | {
          type: "detach";
          projectId: string;
          chatSessionId: string;
          projectRuntimeId: string;
          resolve: (value: boolean) => void;
      }
    | {
          type: "attach";
          projectId: string;
          chatSessionId: string;
          projectRuntimeId: string;
          resolve: (value: boolean) => void;
      }
    | {
          type: "detach-then-attach";
          projectId: string;
          chatSessionId: string;
          alreadyConnectedRuntimeId?: string | null | undefined;
          projectRuntimeId: string;
          alreadyConnectedChatSessionId?: string | null | undefined;
          resolve: (value: boolean) => void;
      };

interface RuntimeChatSessionState {
    pending: PendingState;
    isMutating: boolean;
    openDetach: ({ projectId, chatSessionId, projectRuntimeId }: { projectId: string; chatSessionId: string; projectRuntimeId: string }) => Promise<boolean>;
    openAttach: ({
        projectId,
        chatSessionId,
        alreadyConnectedRuntimeId,
        projectRuntimeId,
        alreadyConnectedChatSessionId,
    }: {
        projectId: string;
        chatSessionId: string;
        alreadyConnectedRuntimeId?: string | null | undefined;
        projectRuntimeId: string;
        alreadyConnectedChatSessionId?: string | null | undefined;
    }) => Promise<boolean>;
    closePending: (result: boolean) => void;
    setIsMutating: (value: boolean) => void;
}

export const runtimeChatSessionStore = createStore<RuntimeChatSessionState>((set, get) => ({
    pending: null,
    isMutating: false,

    openDetach: ({ projectId, chatSessionId, projectRuntimeId }) =>
        new Promise<boolean>((resolve) => {
            set({
                pending: { type: "detach", projectId, chatSessionId, projectRuntimeId, resolve },
            });
        }),

    openAttach: ({ projectId, chatSessionId, projectRuntimeId, alreadyConnectedChatSessionId, alreadyConnectedRuntimeId }) =>
        new Promise<boolean>((resolve) => {
            const needToDetachFirst = alreadyConnectedChatSessionId != null || alreadyConnectedRuntimeId != null;

            if (needToDetachFirst) {
                set({
                    pending: {
                        type: "detach-then-attach",
                        projectId,
                        chatSessionId,
                        alreadyConnectedRuntimeId,
                        projectRuntimeId,
                        alreadyConnectedChatSessionId,
                        resolve,
                    },
                });
            } else {
                set({
                    pending: { type: "attach", projectId, chatSessionId, projectRuntimeId, resolve },
                });
            }
        }),

    closePending: (result) => {
        const { pending } = get();
        if (pending) pending.resolve(result);
        set({ pending: null, isMutating: false });
    },

    setIsMutating: (value) => set({ isMutating: value }),
}));
