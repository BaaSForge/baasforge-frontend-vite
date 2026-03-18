import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import { ChatMessageDeliveryStatus, ChatSessionRoleType, type ChatMessageWithDeliveryStatus, type TextMessagePayload } from "@/modules/project-chat/types";
import { toast } from "sonner";
import { Copy } from "lucide-react";

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

function getDisplayText(payload: unknown): string {
    if (typeof payload === "string") return payload;
    if (payload == null || typeof payload !== "object") return "";
    const p = payload as TextMessagePayload;
    const text = typeof p.text === "string" ? p.text.trim() : "";
    const toolCalls = Array.isArray(p.requested_tool_calls) ? p.requested_tool_calls : [];
    if (text) return text;
    if (toolCalls.length > 0) return `Exploring (${toolCalls.length} tool call${toolCalls.length === 1 ? "" : "s"})`;
    return "";
}

export function TextMessage({ message, onRetry }: TextMessageProps) {
    const resolvedTheme = useResolvedTheme();
    const { copy } = useClipboard();
    const text = getDisplayText(message.payload);
    const isUser = message.role === ChatSessionRoleType.User;
    const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
    const markdownTheme: MarkdownTheme | undefined = isUser ? (resolvedTheme === "dark" ? "light" : "dark") : undefined;

    const handleCopy = async () => {
        const { success } = await copy(text);
        if (success) toast.success("Copied to clipboard", { position: "top-center" });
        else toast.error("Failed to copy");
    };

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
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[0.625rem]">{formatMessageTime(message.created_at)}</span>
                        <div className="ml-2 flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                                aria-label="Copy message"
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                    </div>
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
