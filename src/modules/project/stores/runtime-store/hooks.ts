"use client";

import { useStore } from "zustand";
import { runtimeChatSessionStore } from "./store";

export function useRuntimeChatSessionActions() {
    const openDetach = useStore(runtimeChatSessionStore, (s) => s.openDetach);
    const openAttach = useStore(runtimeChatSessionStore, (s) => s.openAttach);
    return {
        detachRuntime: openDetach,
        attachRuntime: openAttach,
    };
}

export function useRuntimeChatSessionDialogState() {
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
