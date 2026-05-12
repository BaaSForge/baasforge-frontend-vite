import { serializedTextToStickyPreview } from "@/components/chat-rich-text-editor/parse-serialized-inline-segments";
import { cn } from "@/lib/utils";
import { ChatMessageType, ChatSessionRoleType, type ChatMessageWithDeliveryStatus, type TextMessagePayload } from "@/modules/project-chat/types";

function getUserTextStickyPreview(message: ChatMessageWithDeliveryStatus): string {
    if (message.type !== ChatMessageType.Text || message.role !== ChatSessionRoleType.User) return "";
    const payload = message.payload;
    if (typeof payload === "string") return serializedTextToStickyPreview(payload);
    if (payload == null || typeof payload !== "object") return "";
    const p = payload as TextMessagePayload;
    return typeof p.text === "string" ? serializedTextToStickyPreview(p.text) : "";
}

export function StickyMessageLineUser({ message, className }: { message: ChatMessageWithDeliveryStatus; className?: string }) {
    const line = getUserTextStickyPreview(message);
    const body = line || "Message";
    return (
        <span className={cn("min-w-0 truncate text-sm text-inverse-foreground", className)} title={body}>
            {body}
        </span>
    );
}
