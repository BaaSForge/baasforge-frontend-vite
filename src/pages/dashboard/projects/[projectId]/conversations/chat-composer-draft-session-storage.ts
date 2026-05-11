const PREFIX = "baal:chat-composer-draft:v1";

export function chatComposerDraftStorageKey(projectId: string, conversationId: string | undefined): string {
    return `${PREFIX}:${projectId}:${conversationId ?? "new"}`;
}

export function readChatComposerDraft(key: string): string | null {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeChatComposerDraft(key: string, serialized: string): void {
    try {
        if (serialized === "") {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, serialized);
        }
    } catch {
        /* quota / private mode */
    }
}
