import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
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
import { Copy, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatComposerSendButton } from "../chat-composer-send-button";
import { useLiveProductionTimelineAfter } from "./live-production-timeline-context";
import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { InverseMessageCard } from "./inverse-message-card.tsx";
import { ExploringToolCallsMessage } from "./exploring-tool-calls-message";
import { AiMessageStatusIcon, DeliveryStatusIcon } from "./message-icons";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";

export type TextMessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    onSubmitMessageEdit?: (message: ChatMessageWithDeliveryStatus, newText: string) => Promise<void>;
    isSubmittingEdit?: boolean;
    isAnyMessageGenerating?: boolean;
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

export function TextMessage({
    message,
    onRetry,
    onSubmitMessageEdit,
    isSubmittingEdit = false,
    isAnyMessageGenerating = false,
}: TextMessageProps) {
    const resolvedTheme = useResolvedTheme();
    const { copy } = useClipboard();
    const { text, isExploringPlaceholder, toolCallCount } = getTextMessageDisplay(message.payload);
    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!isEditing) return;
        const el = editTextareaRef.current;
        if (!el) return;
        const moveCaretToEnd = () => {
            const len = el.value.length;
            el.setSelectionRange(len, len);
        };
        el.focus();
        moveCaretToEnd();
        requestAnimationFrame(() => {
            moveCaretToEnd();
        });
    }, [isEditing]);

    const liveProdTimelineAfter = useLiveProductionTimelineAfter();

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

    const editBlockedFromApi = message.is_edit_disabled_due_to_live_production_release === true;
    const editBlockedFromRuntimes = liveProdTimelineAfter(message.id);
    const editBlockedByLiveProductionRelease =
        editBlockedFromRuntimes !== undefined ? editBlockedFromRuntimes : editBlockedFromApi;
    const editBlockedByGeneration = isAnyMessageGenerating;
    const showEditAction =
        isUser &&
        hasText &&
        !isUserPendingOrFailed &&
        onSubmitMessageEdit &&
        message.is_optimistic !== true;

    const handleCopy = async () => {
        const { success } = await copy(text);
        if (success) toast.success("Copied to clipboard", { position: "top-center" });
        else toast.error("Failed to copy");
    };

    const handleSendEdit = async () => {
        const trimmed = draft.trim();
        if (!trimmed || !onSubmitMessageEdit || editBlockedByGeneration) return;
        await onSubmitMessageEdit(message, trimmed);
        setIsEditing(false);
    };

    const showAiStatus = message.role === ChatSessionRoleType.Ai && message.status != null;
    const showUserDelivery = message.role === ChatSessionRoleType.User;
    const hasStatusStrip = showAiStatus || showUserDelivery;
    const hasActions = showCopyAction || isFailed || showEditAction;
    const showStatusActionDivider = hasStatusStrip && hasActions;

    if (isUser && isEditing && !editBlockedByGeneration) {
        const canSendEdit = draft.trim().length > 0 && !isSubmittingEdit;
        return (
            <div className="flex w-full justify-end">
                <div className="flex w-full min-w-0 max-w-full flex-col items-end gap-1">
                    <InputGroup className="w-full flex flex-col !bg-background shadow-2xl">
                        <InputGroupTextarea
                            ref={editTextareaRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    if (!isSubmittingEdit) setIsEditing(false);
                                    return;
                                }
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!isSubmittingEdit && canSendEdit) void handleSendEdit();
                                }
                            }}
                            placeholder="Edit message, Shift+Enter for new line"
                            className="min-h-24 px-3 py-3 pb-0"
                            rows={3}
                            disabled={isSubmittingEdit}
                        />
                        <InputGroupAddon align="block-end" className="!flex !flex-row !items-center !justify-end !gap-2 !p-3 !pt-0">
                            <div className="flex shrink-0 items-center gap-2">
                                <InputGroupButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isSubmittingEdit}
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </InputGroupButton>
                                <ChatComposerSendButton
                                    isGenerating={false}
                                    canSend={canSendEdit}
                                    onSend={() => void handleSendEdit()}
                                    isLoading={isSubmittingEdit}
                                    className="!ml-0"
                                />
                            </div>
                        </InputGroupAddon>
                    </InputGroup>
                    {showUserDelivery && (
                        <div className="flex min-h-6 items-center gap-1.5">
                            <DeliveryStatusIcon status={message.delivery_status} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                            <Markdown theme={markdownTheme} embeddedOnInverse>
                                {text}
                            </Markdown>
                        </div>
                    </InverseMessageCard>
                ) : (
                    <div className="relative min-w-0 max-w-full overflow-hidden py-2">
                        <ScrollHighlightOverlay show={isScrollHighlight} className="rounded-2xl bg-muted/90" />
                        <div className="relative z-[1] min-w-0 text-sm">
                            <Markdown theme={markdownTheme}>{text}</Markdown>
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
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            className={cn(
                                                "h-6 shrink-0 gap-1 px-2 text-xs font-medium",
                                                "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                            )}
                                            onClick={() => {
                                                setDraft(text);
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Pencil className="size-3" />
                                            Edit
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
