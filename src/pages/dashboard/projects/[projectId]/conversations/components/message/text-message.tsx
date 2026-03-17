import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatMessageDeliveryStatus, ChatSessionRoleType, type ChatMessageWithDeliveryStatus, type TextMessagePayload } from "@/modules/project-chat/types";

import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";

export type TextMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

function formatMessageTime(dateValue: string): string {
    return new Date(dateValue).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getTextFromPayload(payload: unknown): string {
    if (typeof payload === "string") return payload;
    if (payload != null && typeof payload === "object" && "text" in payload && typeof (payload as TextMessagePayload).text === "string") {
        return (payload as TextMessagePayload).text;
    }
    return "";
}

export function TextMessage({ message, onRetry }: TextMessageProps) {
    const resolvedTheme = useResolvedTheme();
    const text = getTextFromPayload(message.payload);
    const isUser = message.role === ChatSessionRoleType.User;
    const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
    const markdownTheme: MarkdownTheme | undefined = isUser ? (resolvedTheme === "dark" ? "light" : "dark") : undefined;

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div className={cn("flex min-w-0 flex-col gap-1", isUser ? "items-end max-w-[80%]" : "items-start max-w-full")}>
                <div className={cn("min-w-0 max-w-full", isUser ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground" : "")}>
                    <div className="min-w-0 text-sm">
                        <Markdown theme={markdownTheme}>{text}</Markdown>
                    </div>
                </div>
                <div className={cn("flex h-6 items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
                    {message.role === ChatSessionRoleType.Ai && message.status != null && <AiMessageStatusIcon status={message.status} />}
                    <span className="text-muted-foreground text-[0.625rem]">{formatMessageTime(message.created_at)}</span>
                    {message.role === ChatSessionRoleType.User && <DeliveryStatusIcon status={message.delivery_status} />}
                    {isFailed && (
                        <Badge variant="destructive" className="cursor-pointer text-[0.625rem]" onClick={() => onRetry?.(message)}>
                            Retry
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
