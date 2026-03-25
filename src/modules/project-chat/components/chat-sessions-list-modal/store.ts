import { createStore, useStore } from "zustand";

export interface ChatSessionsModalState {
    isOpen: boolean;
    projectId: string | undefined;
    open: (projectId: string) => void;
    close: () => void;
}

const chatSessionsModalStore = createStore<ChatSessionsModalState>((set) => ({
    isOpen: false,
    projectId: undefined,
    open: (projectId) => set({ isOpen: true, projectId }),
    close: () => set({ isOpen: false }),
}));

export { chatSessionsModalStore };

export function useChatSessionsModal() {
    const open = useStore(chatSessionsModalStore, (s) => s.open);
    const close = useStore(chatSessionsModalStore, (s) => s.close);
    return [open, close] as const;
}

export function useChatSessionsModalState() {
    const isOpen = useStore(chatSessionsModalStore, (s) => s.isOpen);
    const projectId = useStore(chatSessionsModalStore, (s) => s.projectId);
    return { isOpen, projectId };
}
