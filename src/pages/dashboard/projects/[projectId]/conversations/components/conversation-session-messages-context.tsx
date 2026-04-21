"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

const ConversationSessionMessagesContext = createContext<readonly ChatMessageWithDeliveryStatus[] | null>(null);

export function ConversationSessionMessagesProvider({
    messages,
    children,
}: {
    messages: readonly ChatMessageWithDeliveryStatus[];
    children: ReactNode;
}) {
    return (
        <ConversationSessionMessagesContext.Provider value={messages}>{children}</ConversationSessionMessagesContext.Provider>
    );
}

export function useConversationSessionMessages(): readonly ChatMessageWithDeliveryStatus[] {
    return useContext(ConversationSessionMessagesContext) ?? [];
}
