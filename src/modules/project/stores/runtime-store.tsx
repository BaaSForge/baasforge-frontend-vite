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
  const setIsMutating = useStore(runtimeChatSessionStore, (s) => s.setIsMutating);
  return {
    pending,
    isMutating,
    closePending,
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
    setIsMutating,
  } = useRuntimeChatSessionDialogState();

  const projectId = pending?.projectId ?? 0;
  const chatSessionId = pending?.chatSessionId ?? 0;
  const projectRuntimeId = pending?.projectRuntimeId ?? 0;
  const detachMutation = useDetachChatSessionStageRuntimeMutation();
  const attachMutation = useAttachChatSessionStageRuntimeMutation({
    projectId,
    chatSessionId,
    projectRuntimeId,
  });

  const handleDetachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "detach") return;
    setIsMutating(true);
    try {
      await detachMutation.mutateAsync({
        projectId,
        chatSessionId,
        projectRuntimeId,
      });
      toast.success("Runtime disconnected from chat session.", { position: toastPosition });
      closePending(true);
    } catch {
      setIsMutating(false);
    }
  }, [pending, detachMutation, closePending, setIsMutating, projectId, chatSessionId, projectRuntimeId]);

  const handleAttachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "attach") return;
    setIsMutating(true);
    try {
      await attachMutation.mutateAsync();
      toast.success("Runtime connected to chat session.", { position: toastPosition });
      closePending(true);
    } catch {
      setIsMutating(false);
    }
  }, [pending, attachMutation, closePending, setIsMutating]);

  const handleDetachThenAttachConfirm = React.useCallback(async () => {
    if (!pending || pending.type !== "detach-then-attach") return;
    const { alreadyConnectedRuntimeId, alreadyConnectedChatSessionId } = pending;

    setIsMutating(true);
    try {
      if (alreadyConnectedRuntimeId) {
        await detachMutation.mutateAsync({
          projectId,
          chatSessionId,
          projectRuntimeId: alreadyConnectedRuntimeId,
        });
        toast.success("Previous runtime disconnected.", { position: toastPosition });
      }
      if (alreadyConnectedChatSessionId) {
        await detachMutation.mutateAsync({
          projectId,
          chatSessionId: alreadyConnectedChatSessionId,
          projectRuntimeId,
        });
        toast.success("Previous chat session disconnected.", { position: toastPosition });
      }
      await attachMutation.mutateAsync();
      toast.success("Runtime connected to chat session.", { position: toastPosition });
      closePending(true);
    } catch {
      setIsMutating(false);
    }
  }, [pending, detachMutation, attachMutation, closePending, setIsMutating, projectId, chatSessionId, projectRuntimeId]);

  const isDetachOnlyOpen = pending?.type === "detach";
  const isDetachThenAttachOpen = pending?.type === "detach-then-attach";
  const isAttachOpen = pending?.type === "attach";

  return (
    <>
      <AlertDialog open={isDetachOnlyOpen} onOpenChange={(open) => !open && closePending(false)}>
        <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
            <DialogMedia variant="destructive" />
            <div className="flex flex-col gap-2">
              <AlertDialogTitle>Disconnect runtime from chat?</AlertDialogTitle>
              <AlertDialogDescription>
                The chat session will no longer use this runtime. The runtime
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

      {pending?.type === "detach-then-attach" && (
        <AlertDialog open={isDetachThenAttachOpen} onOpenChange={(open) => !open && closePending(false)}>
          <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
            <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
              <DialogMedia variant="default" />
              <div className="flex flex-col gap-2">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="text-destructive block">

                    {pending.alreadyConnectedRuntimeId && pending.alreadyConnectedChatSessionId ? 
                      "Runtime and chat session are already connected and need to be disconnected first."
                    : pending.alreadyConnectedRuntimeId ? 
                      "This chat session is already connected to a runtime."
                    : pending.alreadyConnectedChatSessionId ? 
                      "This runtime is already connected to a chat session."
                    : ""}
                  </span>
                  
                  We will disconnect the existing connection and connect the new one. Continue?
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
                {isMutating ? "Switching…" : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={isAttachOpen} onOpenChange={(open) => !open && closePending(false)}>
        <AlertDialogContent className="sm:max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader className="flex flex-row gap-3 sm:text-left">
            <DialogMedia variant="default" />
            <div className="flex flex-col gap-2">
              <AlertDialogTitle>Connect runtime to this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                The chat session will use this runtime for testing. Any
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
                handleAttachConfirm();
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

export { Link2 as ConnectIcon, Unplug as DisconnectIcon };