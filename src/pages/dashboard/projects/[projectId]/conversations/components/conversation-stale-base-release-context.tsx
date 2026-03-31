import * as React from "react";

export { STALE_BASE_RELEASE_CONVERSATION_MESSAGE } from "@/modules/project-chat/stale-base-release-conversation-message";

const ConversationStaleBaseReleaseContext = React.createContext(false);

export function ConversationStaleBaseReleaseProvider({
    staleBaseRelease,
    children,
}: {
    staleBaseRelease: boolean;
    children: React.ReactNode;
}) {
    return (
        <ConversationStaleBaseReleaseContext.Provider value={staleBaseRelease}>
            {children}
        </ConversationStaleBaseReleaseContext.Provider>
    );
}

export function useConversationStaleBaseRelease(): boolean {
    return React.useContext(ConversationStaleBaseReleaseContext);
}
