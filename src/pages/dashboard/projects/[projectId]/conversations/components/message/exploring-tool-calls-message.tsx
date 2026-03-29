import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";
import { InverseMessageCard } from "./inverse-message-card.tsx";
import { ChatMessageDeliveryStatus, ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";

export type ExploringToolCallsMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    toolCallCount: number;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

export function ExploringToolCallsMessage({ message, toolCallCount, onRetry }: ExploringToolCallsMessageProps) {
    const isUser = message.role === ChatSessionRoleType.User;
    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);
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
                {isUser ? (
                    <InverseMessageCard className="relative overflow-hidden flex flex-row items-center gap-2">
                        <ScrollHighlightOverlay
                            show={isScrollHighlight}
                            className="rounded-2xl rounded-br-md bg-primary/65"
                        />
                        <div className="relative z-[1] flex min-w-0 flex-row items-center gap-2">
                            {statusSlot}
                            <span className="min-w-0 text-sm text-inverse-foreground/70">{label}</span>
                        </div>
                    </InverseMessageCard>
                ) : (
                    <div className="flex min-w-0 max-w-full items-center gap-2">
                        {statusSlot}
                        <span className="min-w-0 text-sm text-muted-foreground">{label}</span>
                    </div>
                )}
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
