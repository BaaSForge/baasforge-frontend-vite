"use client";

import { createStore } from "zustand";

type PendingState =
  | null
  | {
      type: "detach";
      projectId: number;
      chatSessionId: number;
      projectRuntimeId: number;
      resolve: (value: boolean) => void;
    }
  | {
      type: "attach";
      projectId: number;
      chatSessionId: number;
      projectRuntimeId: number;
      resolve: (value: boolean) => void;
    }
  | {
      type: "detach-then-attach";
      projectId: number;
      chatSessionId: number;
      alreadyConnectedRuntimeId?: number | null | undefined;
      projectRuntimeId: number;
      alreadyConnectedChatSessionId?: number | null | undefined;
      resolve: (value: boolean) => void;
    };

interface RuntimeChatSessionState {
  pending: PendingState;
  isMutating: boolean;
  openDetach: ({
    projectId,
    chatSessionId,
    projectRuntimeId
  }: {
    projectId: number;
    chatSessionId: number;
    projectRuntimeId: number;
  }) => Promise<boolean>;
  openAttach: ({
    projectId,
    chatSessionId,
    alreadyConnectedRuntimeId,
    projectRuntimeId,
    alreadyConnectedChatSessionId,
  }: {
    projectId: number;
    chatSessionId: number;
    alreadyConnectedRuntimeId?: number | null | undefined;
    projectRuntimeId: number;
    alreadyConnectedChatSessionId?: number | null | undefined;
  }) => Promise<boolean>;
  closePending: (result: boolean) => void;
  setIsMutating: (value: boolean) => void;
}

export const runtimeChatSessionStore = createStore<RuntimeChatSessionState>(
  (set, get) => ({
    pending: null,
    isMutating: false,

    openDetach: ({ projectId, chatSessionId, projectRuntimeId }) =>
      new Promise<boolean>((resolve) => {
        set({
          pending: { type: "detach", projectId, chatSessionId, projectRuntimeId, resolve },
        });
      }),

    openAttach: ({
      projectId,
      chatSessionId,
      projectRuntimeId,
      alreadyConnectedChatSessionId,
      alreadyConnectedRuntimeId,
    }) =>
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
  })
);