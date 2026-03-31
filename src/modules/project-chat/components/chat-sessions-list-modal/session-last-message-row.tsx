import { MarkdownPlainPreview } from "@/components/markdown";
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

type SessionLastMessageRowProps = {
    lastMessage: ChatMessageResponse | null | undefined;
};

/** One-line preview of the session's last message (text). */
export function SessionLastMessageRow({ lastMessage }: SessionLastMessageRowProps) {
    if (lastMessage == null) return null;

    const { text, isExploringPlaceholder } = getCompactTextFromPayload(lastMessage.payload);
    if (isExploringPlaceholder) {
        return (
            <div className="flex w-full min-w-0 justify-start">
                <div className="min-w-0 max-w-full">
                    <p className="text-muted-foreground line-clamp-3 text-left text-xs leading-snug">Exploring…</p>
                </div>
            </div>
        );
    }
    if (!text) return null;

    return (
        <div className="flex w-full min-w-0 justify-start">
            <div className="min-w-0 max-w-full">
                <MarkdownPlainPreview
                    source={text}
                    className="text-muted-foreground line-clamp-3 text-left text-xs leading-snug"
                />
            </div>
        </div>
    );
}
