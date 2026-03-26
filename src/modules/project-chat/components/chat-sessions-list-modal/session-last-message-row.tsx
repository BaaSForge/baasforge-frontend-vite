import type { ChatMessageResponse, TextMessagePayload } from "@/modules/project-chat/types";

function getCompactTextFromPayload(payload: unknown): { text: string; isExploringPlaceholder: boolean } {
    if (typeof payload === "string") return { text: payload, isExploringPlaceholder: false };
    if (payload == null || typeof payload !== "object") return { text: "", isExploringPlaceholder: false };
    const p = payload as TextMessagePayload;
    const text = typeof p.text === "string" ? p.text.trim() : "";
    const toolCalls = Array.isArray(p.requested_tool_calls) ? p.requested_tool_calls : [];
    if (text) return { text, isExploringPlaceholder: false };
    if (toolCalls.length > 0) return { text: "", isExploringPlaceholder: true };
    return { text: "", isExploringPlaceholder: false };
}

function plainPreview(raw: string): string {
    return raw
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

type SessionLastMessageRowProps = {
    lastMessage: ChatMessageResponse | null | undefined;
};

/** One-line preview of the session's last message (text). */
export function SessionLastMessageRow({ lastMessage }: SessionLastMessageRowProps) {
    if (lastMessage == null) return null;

    const { text, isExploringPlaceholder } = getCompactTextFromPayload(lastMessage.payload);
    const content = isExploringPlaceholder ? "Exploring…" : plainPreview(text);
    if (!content) return null;

    return (
        <div className="flex w-full min-w-0 justify-start">
            <div className="max-w-[80%] min-w-0">
                <p className="text-muted-foreground line-clamp-2 text-left text-xs leading-snug">{content}</p>
            </div>
        </div>
    );
}
