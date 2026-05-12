import { ChatSerializedMessageBody } from "@/components/chat-rich-text-editor/chat-serialized-message-body";
import { type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
} from "@/modules/project-chat/types";
import { Copy, Pencil, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { useLiveProductionSessionGates } from "./live-production-timeline-context";
import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { InverseMessageCard } from "./inverse-message-card.tsx";
import { ExploringToolCallsMessage } from "./exploring-tool-calls-message";
import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";

export type TextMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    onRequestEditMessage?: (message: ChatMessageWithDeliveryStatus) => void;
    onRequestRevertToThisMessage?: (message: ChatMessageWithDeliveryStatus) => void;
    isTruncatingBranch?: boolean;
    isAnyMessageGenerating?: boolean;
};

function getTextMessageDisplay(payload: unknown): {
    /** Exact wire-format text (trimmed only for empty / placeholder checks). */
    rawText: string;
    isExploringPlaceholder: boolean;
    toolCallCount: number;
} {
    if (typeof payload === "string")
        return { rawText: payload, isExploringPlaceholder: false, toolCallCount: 0 };
    if (payload == null || typeof payload !== "object")
        return { rawText: "", isExploringPlaceholder: false, toolCallCount: 0 };
    const p = payload as TextMessagePayload;
    const rawText = typeof p.text === "string" ? p.text : "";
    const toolCalls = Array.isArray(p.requested_tool_calls) ? p.requested_tool_calls : [];
    if (rawText.trim())
        return { rawText, isExploringPlaceholder: false, toolCallCount: 0 };
    if (toolCalls.length > 0)
        return { rawText: "", isExploringPlaceholder: true, toolCallCount: toolCalls.length };
    return { rawText: "", isExploringPlaceholder: false, toolCallCount: 0 };
}

export function TextMessage({
    message,
    onRetry,
    onRequestEditMessage,
    onRequestRevertToThisMessage,
    isTruncatingBranch = false,
    isAnyMessageGenerating = false,
}: TextMessageProps) {
    const resolvedTheme = useResolvedTheme();
    const { copy } = useClipboard();
    const { rawText, isExploringPlaceholder, toolCallCount } = getTextMessageDisplay(message.payload);
    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);

    const { userEditSubsequentLiveProd } = useLiveProductionSessionGates();

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
    const hasText = rawText.trim().length > 0;
    const showCopyAction = hasText && !isAiGeneratingOrFailed && !isUserPendingOrFailed;

    const editBlockedFromSession = userEditSubsequentLiveProd(message.id);
    const editBlockedFromApi = message.is_edit_disabled_due_to_live_production_release === true;
    const editBlockedByLiveProductionRelease =
        editBlockedFromSession !== undefined ? editBlockedFromSession : editBlockedFromApi;
    const editBlockedByGeneration = isAnyMessageGenerating;
    const showEditAction =
        isUser &&
        hasText &&
        !isUserPendingOrFailed &&
        onRequestEditMessage &&
        message.is_optimistic !== true;
    const showRevertAction =
        isUser &&
        hasText &&
        !isUserPendingOrFailed &&
        onRequestRevertToThisMessage &&
        message.is_optimistic !== true;

    const handleCopy = async () => {
        const { success } = await copy(rawText);
        if (success) toast.success("Copied to clipboard", { position: "top-center" });
        else toast.error("Failed to copy");
    };

    const showAiStatus = message.role === ChatSessionRoleType.Ai && message.status != null;
    const showUserDelivery = message.role === ChatSessionRoleType.User;
    const hasStatusStrip = showAiStatus || showUserDelivery;
    const hasActions = showCopyAction || isFailed || showEditAction || showRevertAction;
    const showStatusActionDivider = hasStatusStrip && hasActions;

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "flex min-w-0 flex-col gap-1",
                    isUser ? "max-w-[80%] items-end" : "max-w-full items-start",
                )}
            >
                {isUser ? (
                    <InverseMessageCard className="relative overflow-hidden">
                        <ScrollHighlightOverlay
                            show={isScrollHighlight}
                            className="rounded-2xl rounded-br-md bg-primary/65"
                        />
                        <div className="relative z-[1] min-w-0 text-sm">
                            <ChatSerializedMessageBody
                                serialized={rawText}
                                markdownTheme={markdownTheme}
                                embeddedOnInverse
                            />
                        </div>
                    </InverseMessageCard>
                ) : (
                    <div className="relative min-w-0 max-w-full overflow-hidden py-2">
                        <ScrollHighlightOverlay show={isScrollHighlight} className="rounded-2xl bg-muted/90" />
                        <div className="relative z-[1] min-w-0 text-sm">
                            <ChatSerializedMessageBody serialized={rawText} markdownTheme={markdownTheme} />
                        </div>
                    </div>
                )}
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
                                    className={cn(
                                        "h-6 shrink-0 gap-1 px-2 text-xs font-medium",
                                        isUser
                                            ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                            : "text-primary hover:bg-primary/10 hover:text-primary",
                                    )}
                                    onClick={handleCopy}
                                >
                                    <Copy className="size-3" />
                                    Copy
                                </Button>
                            )}
                            {showEditAction && (
                                <>
                                    {editBlockedByLiveProductionRelease ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                                        disabled
                                                    >
                                                        <Pencil className="size-3" />
                                                        Edit
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[18rem]">
                                                You cannot edit this message while a live production release exists after this point on the timeline.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : editBlockedByGeneration ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                                        disabled
                                                    >
                                                        <Pencil className="size-3" />
                                                        Edit
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                You cannot edit while a response is generating.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : isTruncatingBranch ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                                        disabled
                                                    >
                                                        <Spinner className="size-3" />
                                                        Edit
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Please wait.</TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            className={cn(
                                                "h-6 shrink-0 gap-1 px-2 text-xs font-medium",
                                                "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                            )}
                                            onClick={() => onRequestEditMessage?.(message)}
                                        >
                                            <Pencil className="size-3" />
                                            Edit
                                        </Button>
                                    )}
                                </>
                            )}
                            {showRevertAction && (
                                <>
                                    {editBlockedByLiveProductionRelease ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                                        disabled
                                                    >
                                                        <Undo2 className="size-3" />
                                                        revert this message
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[18rem]">
                                                You cannot revert from this message while a live production release exists after this point on the timeline.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : editBlockedByGeneration ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                                        disabled
                                                    >
                                                        <Undo2 className="size-3" />
                                                        revert this message
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                You cannot revert while a response is generating.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : isTruncatingBranch ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            className="h-6 shrink-0 gap-1 px-2 text-xs font-medium text-muted-foreground"
                                            disabled
                                        >
                                            <Spinner className="size-3" />
                                            revert this message
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            className={cn(
                                                "h-6 shrink-0 gap-1 px-2 text-xs font-medium",
                                                "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                            )}
                                            onClick={() => onRequestRevertToThisMessage?.(message)}
                                        >
                                            <Undo2 className="size-3" />
                                            revert this message
                                        </Button>
                                    )}
                                </>
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
