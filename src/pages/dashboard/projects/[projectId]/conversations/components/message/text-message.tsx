import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
} from "@/modules/project-chat/types";
import { toast } from "sonner";
import { Copy } from "lucide-react";

import { ExploringToolCallsMessage } from "./exploring-tool-calls-message";
import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";

export type TextMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

function getTextMessageDisplay(payload: unknown): {
    text: string;
    isExploringPlaceholder: boolean;
    toolCallCount: number;
} {
    if (typeof payload === "string") return { text: payload, isExploringPlaceholder: false, toolCallCount: 0 };
    if (payload == null || typeof payload !== "object")
        return { text: "", isExploringPlaceholder: false, toolCallCount: 0 };
    const p = payload as TextMessagePayload;
    const text = typeof p.text === "string" ? p.text.trim() : "";
    const toolCalls = Array.isArray(p.requested_tool_calls) ? p.requested_tool_calls : [];
    if (text) return { text, isExploringPlaceholder: false, toolCallCount: 0 };
    if (toolCalls.length > 0)
        return { text: "", isExploringPlaceholder: true, toolCallCount: toolCalls.length };
    return { text: "", isExploringPlaceholder: false, toolCallCount: 0 };
}

export function TextMessage({ message, onRetry }: TextMessageProps) {
    const resolvedTheme = useResolvedTheme();
    const { copy } = useClipboard();
    const { text, isExploringPlaceholder, toolCallCount } = getTextMessageDisplay(message.payload);

    if (isExploringPlaceholder) {
        return <ExploringToolCallsMessage message={message} toolCallCount={toolCallCount} onRetry={onRetry} />;
    }

    const isUser = message.role === ChatSessionRoleType.User;
    const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
    const markdownTheme: MarkdownTheme | undefined = isUser ? (resolvedTheme === "dark" ? "light" : "dark") : undefined;

    const isAiGeneratingOrFailed =
        message.role === ChatSessionRoleType.Ai &&
        message.status != null &&
        (message.status === ChatMessageStatus.Generating || message.status === ChatMessageStatus.Failed);
    const isUserPendingOrFailed =
        message.role === ChatSessionRoleType.User &&
        (message.delivery_status === ChatMessageDeliveryStatus.Pending ||
            message.delivery_status === ChatMessageDeliveryStatus.Failed);
    const hasText = text.trim().length > 0;
    const showCopyAction = hasText && !isAiGeneratingOrFailed && !isUserPendingOrFailed;

    const handleCopy = async () => {
        const { success } = await copy(text);
        if (success) toast.success("Copied to clipboard", { position: "top-center" });
        else toast.error("Failed to copy");
    };

    const showAiStatus = message.role === ChatSessionRoleType.Ai && message.status != null;
    const showUserDelivery = message.role === ChatSessionRoleType.User;
    const hasStatusStrip = showAiStatus || showUserDelivery;
    const hasActions = showCopyAction || isFailed;
    const showStatusActionDivider = hasStatusStrip && hasActions;

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div className={cn("flex min-w-0 flex-col gap-1", isUser ? "items-end max-w-[80%]" : "items-start max-w-full")}>
                <div className={cn("min-w-0 max-w-full", isUser ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground" : "")}>
                    <div className="min-w-0 text-sm">
                        <Markdown theme={markdownTheme}>{text}</Markdown>
                    </div>
                </div>
                <div className={cn("flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1", isUser ? "flex-row-reverse" : "flex-row")}>
                    {hasStatusStrip && (
                        <div className={cn("flex items-center gap-1.5", isUser && "flex-row-reverse")}>
                            {showAiStatus && <AiMessageStatusIcon status={message.status!} />}
                            {showUserDelivery && <DeliveryStatusIcon status={message.delivery_status} />}
                        </div>
                    )}
                    {showStatusActionDivider && <span className="hidden h-3 w-px shrink-0 bg-border sm:block" aria-hidden />}
                    {hasActions && (
                        <div className={cn("flex items-center gap-2", isUser && "flex-row-reverse")}>
                            {showCopyAction && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                                    onClick={handleCopy}
                                >
                                    <Copy className="size-3" />
                                    Copy
                                </Button>
                            )}
                            {isFailed && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="h-6 shrink-0 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onRetry?.(message)}
                                >
                                    Retry
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
