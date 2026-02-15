"use client";

import * as React from "react";
import { createStore, useStore } from "zustand";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDetachChatSessionStageRuntimeMutation,
  useAttachChatSessionStageRuntimeMutation,
} from "../mutations";
import { Unplug, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const toastPosition = "top-center";

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
      phase: "confirm-detach" | "confirm-attach";
      projectId: number;
      chatSessionId: number;
      projectRuntimeId: number;
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
    projectRuntimeId,
    chatSessionCurrentRuntimeId,
  }: {
    projectId: number;
    chatSessionId: number;
    projectRuntimeId: number;
    chatSessionCurrentRuntimeId?: number | null | undefined;
  }) => Promise<boolean>;
  closePending: (result: boolean) => void;
  setPendingPhase: (phase: "confirm-attach") => void;
  setIsMutating: (value: boolean) => void;
}

const runtimeChatSessionStore = createStore<RuntimeChatSessionState>(
  (set, get) => ({
    pending: null,
    isMutating: false,

    openDetach: ({ projectId, chatSessionId, projectRuntimeId }) =>
      new Promise<boolean>((resolve) => {
        set({
          pending: { type: "detach", projectId, chatSessionId, projectRuntimeId, resolve },
        });
      }),

    openAttach: ({ projectId, chatSessionId, projectRuntimeId, chatSessionCurrentRuntimeId }) =>
      new Promise<boolean>((resolve) => {
        const hasExisting = chatSessionCurrentRuntimeId != null;
        if (hasExisting) {
          set({
            pending: {
              type: "detach-then-attach",
              phase: "confirm-detach",
              projectId,
              chatSessionId,
              projectRuntimeId,
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

    setPendingPhase: (phase) =>
      set((state) => {
        if (
          state.pending &&
          state.pending.type === "detach-then-attach"
        ) {
          return { pending: { ...state.pending, phase } };
        }
        return state;
      }),

    setIsMutating: (value) => set({ isMutating: value }),
  })
);

export function useRuntimeChatSessionActions() {
  const openDetach = useStore(runtimeChatSessionStore, (s) => s.openDetach);
  const openAttach = useStore(runtimeChatSessionStore, (s) => s.openAttach);
  return {
    detachRuntime: openDetach,
    attachRuntime: openAttach,
  };
}

function useRuntimeChatSessionDialogState() {
  const pending = useStore(runtimeChatSessionStore, (s) => s.pending);
  const isMutating = useStore(runtimeChatSessionStore, (s) => s.isMutating);
  const closePending = useStore(runtimeChatSessionStore, (s) => s.closePending);
  const setPendingPhase = useStore(runtimeChatSessionStore, (s) => s.setPendingPhase);
  const setIsMutating = useStore(runtimeChatSessionStore, (s) => s.setIsMutating);
  return {
    pending,
    isMutating,
    closePending,
    setPendingPhase,
    setIsMutating,
  };
}

function DialogMedia({
  variant,
  className,
}: {
  variant: "destructive" | "default";
  className?: string;
}) {
  const isDestructive = variant === "destructive";
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        isDestructive
          ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
          : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
        className
      )}
      aria-hidden
    >
      {isDestructive ? (
        <Unplug className="size-5" />
      ) : (
        <Link2 className="size-5" />
      )}
    </div>
  );
}

export function RuntimeChatSessionDialogs() {
  const {
    pending,
    isMutating,
    closePending,
    setPendingPhase,
    setIsMutating,
  } = useRuntimeChatSessionDialogState();

  const projectId = pending?.projectId ?? 0;
  const chatSessionId = pending?.chatSessionId ?? 0;
  const projectRuntimeId = pending?.projectRuntimeId ?? 0;
  const detachMutation = useDetachChatSessionStageRuntimeMutation({
    projectId,
    chatSessionId,
    projectRuntimeId,
  });
  const attachMutation = useAttachChatSessionStageRuntimeMutation({
    projectId,
    chatSessionId,
    projectRuntimeId,
  });

  const handleDetachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "detach") return;
    setIsMutating(true);
    try {
      await detachMutation.mutateAsync();
      toast.success("Runtime disconnected from chat session.", { position: toastPosition });
      closePending(true);
    } catch {
      toast.error("Failed to disconnect runtime.", { position: toastPosition });
      setIsMutating(false);
    }
  }, [pending, detachMutation, closePending, setIsMutating]);

  const handleAttachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "attach") return;
    setIsMutating(true);
    try {
      await attachMutation.mutateAsync();
      toast.success("Runtime connected to chat session.", { position: toastPosition });
      closePending(true);
    } catch {
      toast.error("Failed to connect runtime.", { position: toastPosition });
      setIsMutating(false);
    }
  }, [pending, attachMutation, closePending, setIsMutating]);

  const handleDetachThenAttachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "detach-then-attach") return;
    if (pending.phase === "confirm-detach") {
      setIsMutating(true);
      try {
        await detachMutation.mutateAsync();
        toast.success("Previous runtime disconnected.", { position: toastPosition });
        setPendingPhase("confirm-attach");
      } catch {
        toast.error("Failed to disconnect previous runtime.", { position: toastPosition });
        closePending(false);
        return;
      } finally {
        runtimeChatSessionStore.getState().setIsMutating(false);
      }
    } else {
      setIsMutating(true);
      try {
        await attachMutation.mutateAsync();
        toast.success("Runtime connected to chat session.", { position: toastPosition });
        closePending(true);
      } catch {
        toast.error("Failed to connect runtime.", { position: toastPosition });
        setIsMutating(false);
      }
    }
  }, [pending, detachMutation, attachMutation, closePending, setPendingPhase, setIsMutating]);

  const isDetachOnlyOpen = pending?.type === "detach";
  const isAlreadyConnectedOpen =
    !!pending &&
    pending.type === "detach-then-attach" &&
    pending.phase === "confirm-detach";
  const isAttachOpen =
    pending?.type === "attach" ||
    (pending?.type === "detach-then-attach" &&
      pending.phase === "confirm-attach");

  return (
    <>
      <AlertDialog open={isDetachOnlyOpen} onOpenChange={(open) => !open && closePending(false)}>
        <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
            <DialogMedia variant="destructive" />
            <div className="flex flex-col gap-2">
              <AlertDialogTitle>Disconnect runtime from chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This chat session will no longer use this runtime. The runtime
                will be free to be connected to another chat session for testing.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isMutating}
              onClick={() => closePending(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isMutating}
              onClick={(e) => {
                e.preventDefault();
                handleDetachConfirm();
              }}
            >
              {isMutating ? "Disconnecting…" : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isAlreadyConnectedOpen} onOpenChange={(open) => !open && closePending(false)}>
        <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
            <DialogMedia variant="destructive" />
            <div className="flex flex-col gap-2">
              <AlertDialogTitle>
                This chat is already connected to a runtime
              </AlertDialogTitle>
              <AlertDialogDescription>
                To connect a different runtime, we will first disconnect the
                current one from this chat, then connect the new runtime. Do you
                want to continue?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isMutating}
              onClick={() => closePending(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isMutating}
              onClick={(e) => {
                e.preventDefault();
                handleDetachThenAttachConfirm();
              }}
            >
              {isMutating ? "Disconnecting…" : "Disconnect the current runtime"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isAttachOpen} onOpenChange={(open) => !open && closePending(false)}>
        <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
            <DialogMedia variant="default" />
            <div className="flex flex-col gap-2">
              <AlertDialogTitle>Connect runtime to this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This chat session will use this runtime for testing. Any
                previous connection has been removed if it there was one.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isMutating}
              onClick={() => closePending(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-500 text-white hover:bg-emerald-500/90"
              disabled={isMutating}
              onClick={(e) => {
                e.preventDefault();
                if (pending?.type === "detach-then-attach") {
                  handleDetachThenAttachConfirm();
                } else {
                  handleAttachConfirm();
                }
              }}
            >
              {isMutating ? "Connecting…" : "Connect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}