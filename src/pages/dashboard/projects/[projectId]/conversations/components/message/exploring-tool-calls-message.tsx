import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessageDeliveryStatus, ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";

export type ExploringToolCallsMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    toolCallCount: number;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

export function ExploringToolCallsMessage({ message, toolCallCount, onRetry }: ExploringToolCallsMessageProps) {
    const isUser = message.role === ChatSessionRoleType.User;
    const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
    const label = `Exploring (${toolCallCount} tool call${toolCallCount === 1 ? "" : "s"})`;

    const statusSlot =
        message.role === ChatSessionRoleType.Ai && message.status != null ? (
            <AiMessageStatusIcon status={message.status} />
        ) : isUser ? (
            <DeliveryStatusIcon status={message.delivery_status} />
        ) : null;

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div className={cn("flex min-w-0 flex-col gap-1", isUser ? "items-end max-w-[80%]" : "items-start max-w-full")}>
                <div
                    className={cn(
                        "flex min-w-0 max-w-full items-center gap-2",
                        isUser && "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground",
                    )}
                >
                    {statusSlot}
                    <span
                        className={cn(
                            "min-w-0 text-sm",
                            isUser ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                    >
                        {label}
                    </span>
                </div>
                {isFailed && (
                    <div className={cn("flex min-h-6 items-center gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="h-6 shrink-0 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onRetry?.(message)}
                        >
                            Retry
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
