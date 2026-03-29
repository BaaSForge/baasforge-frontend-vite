import { cn } from "@/lib/utils";
import { ChatMessageType, ChatSessionRoleType, type ChatMessageWithDeliveryStatus, type TextMessagePayload } from "@/modules/project-chat/types";

function getUserTextStickyPreview(message: ChatMessageWithDeliveryStatus): string {
    if (message.type !== ChatMessageType.Text || message.role !== ChatSessionRoleType.User) return "";
    const payload = message.payload;
    if (typeof payload === "string") return payload.replace(/\s+/g, " ").trim();
    if (payload == null || typeof payload !== "object") return "";
    const p = payload as TextMessagePayload;
    return typeof p.text === "string" ? p.text.replace(/\s+/g, " ").trim() : "";
}

const STICKY_USER_PREFIX = "You: ";

export function StickyMessageLineUser({ message, className }: { message: ChatMessageWithDeliveryStatus; className?: string }) {
    const line = getUserTextStickyPreview(message);
    const body = line || "Message";
    const full = `${STICKY_USER_PREFIX}${body}`;
    return (
        <span className={cn("min-w-0 truncate text-sm text-foreground", className)} title={full}>
            {full}
        </span>
    );
}
