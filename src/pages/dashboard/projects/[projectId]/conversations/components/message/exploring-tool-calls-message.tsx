import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";
import { InverseMessageCard } from "./inverse-message-card.tsx";
import { FailedPlannerRetryWithAlert, destructiveRetryButtonClass } from "./failed-planner-retry-button";
import {
    ChatAgentType,
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";

import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";
import { exploringToolCallsAiLabelClassName } from "./tool-header-generating-text";

export type ExploringToolCallsMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    toolCallCount: number;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    onRetryFailedPlannerMessage?: (message: ChatMessageWithDeliveryStatus) => void;
    plannerRetryPendingMessageId?: string | null;
    isAnyMessageGenerating?: boolean;
};

export function ExploringToolCallsMessage({
    message,
    toolCallCount,
    onRetry,
    onRetryFailedPlannerMessage,
    plannerRetryPendingMessageId,
    isAnyMessageGenerating = false,
}: ExploringToolCallsMessageProps) {
    const isUser = message.role === ChatSessionRoleType.User;
    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);
    const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
    const showMainThreadPlannerFailedRetry =
        !isUser &&
        message.status === ChatMessageStatus.Failed &&
        !message.invoking_message_id &&
        message.agent === ChatAgentType.Planner &&
        onRetryFailedPlannerMessage != null;
    const plannerRetryBlockedByGeneration = isAnyMessageGenerating;
    const plannerRetryInFlight = plannerRetryPendingMessageId === message.id;
    const plannerRetryDisabled = plannerRetryBlockedByGeneration || plannerRetryInFlight;
    const label = `Exploring (${toolCallCount} tool call${toolCallCount === 1 ? "" : "s"})`;

    const showAiStatusIcon =
        message.role === ChatSessionRoleType.Ai &&
        message.status != null &&
        !(message.status === ChatMessageStatus.Failed && showMainThreadPlannerFailedRetry);

    const statusSlot =
        showAiStatusIcon ? (
            <AiMessageStatusIcon status={message.status!} />
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
                        <span className={exploringToolCallsAiLabelClassName(message.status)}>{label}</span>
                    </div>
                )}
                {isFailed && (
                    <div className={cn("flex min-h-6 items-center gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className={destructiveRetryButtonClass}
                            onClick={() => onRetry?.(message)}
                        >
                            <RefreshCw className="size-3 shrink-0" />
                            Retry
                        </Button>
                    </div>
                )}
                {showMainThreadPlannerFailedRetry && (
                    <div className="w-full min-w-0">
                        <FailedPlannerRetryWithAlert
                            onRetry={() => onRetryFailedPlannerMessage?.(message)}
                            disabled={plannerRetryDisabled}
                            inFlight={plannerRetryInFlight}
                            blockedByGeneration={plannerRetryBlockedByGeneration}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
