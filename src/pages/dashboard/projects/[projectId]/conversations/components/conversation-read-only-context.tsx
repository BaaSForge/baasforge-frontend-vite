/* eslint-disable react-refresh/only-export-components -- paired provider + hook */
import * as React from "react";

/** Sticky banner + release-controller tooltips when the session is read-only for app-changing actions. */
export const READ_ONLY_CONVERSATION_MESSAGE =
    "Read-only: production no longer matches this session. Chat only — no releases.";

const ConversationReadOnlyContext = React.createContext(false);

export function ConversationReadOnlyProvider({
    readOnly,
    children,
}: {
    readOnly: boolean;
    children: React.ReactNode;
}) {
    return <ConversationReadOnlyContext.Provider value={readOnly}>{children}</ConversationReadOnlyContext.Provider>;
}

export function useConversationReadOnly(): boolean {
    return React.useContext(ConversationReadOnlyContext);
}
