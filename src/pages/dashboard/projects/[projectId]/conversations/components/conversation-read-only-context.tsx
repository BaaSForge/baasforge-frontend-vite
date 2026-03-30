/* eslint-disable react-refresh/only-export-components -- paired provider + hook */
import * as React from "react";

export { READ_ONLY_CONVERSATION_MESSAGE } from "@/modules/project-chat/read-only-conversation-message";

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
