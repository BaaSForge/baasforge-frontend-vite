import { cn } from "@/lib/utils";
import {
    ChatMessageType,
    ChatSessionRoleType,
    getTextPayloadThinkingDisplay,
    type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";

import { MessageThinking } from "./message-thinking";
import { TextMessage } from "./text-message";
import { ToolFetchLatestReleasesMessage } from "./tool-fetch-latest-releases-message";
import { ToolFetchRelevantUnitsMessage } from "./tool-fetch-relevant-units-message";

type MessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

function MessageContent({ message, onRetry }: MessageProps) {
    if (message.type === ChatMessageType.Text) {
        return <TextMessage message={message} onRetry={onRetry} />;
    }
    if (message.type === ChatMessageType.ToolFetchRelevantUnits) {
        return <ToolFetchRelevantUnitsMessage message={message} />;
    }
    if (message.type === ChatMessageType.ToolFetchLatestReleases) {
        return <ToolFetchLatestReleasesMessage message={message} />;
    }
    return null;
}

const toolMessageTypes = [
    ChatMessageType.ToolFetchRelevantUnits,
    ChatMessageType.ToolFetchLatestReleases,
];

export function Message({ message, onRetry }: MessageProps) {
    const isInvokedByAnother = Boolean(message.invoking_message_id);
    const isToolMessage = toolMessageTypes.includes(message.type);
    const isUser = message.role === ChatSessionRoleType.User;
    const thinkingText =
        !isUser && message.type === ChatMessageType.Text
            ? getTextPayloadThinkingDisplay(message.payload)
            : null;

    return (
        <div
            className={cn(
                "relative flex min-w-0 flex-col",
                isUser ? "items-end" : "items-start",
                isToolMessage && "mt-2",
            )}
        >
            {isInvokedByAnother &&
                (isToolMessage ? (
                    null
                    // <div
                    //     className="absolute top-0 -left-8 flex h-12 w-8 items-center"
                    //     aria-hidden
                    // >
                    //     <span className="w-6 h-px bg-border" />
                    // </div>
                ) : (
                    <span
                        className="absolute top-1/2 -left-8 w-6 -translate-y-1/2 h-px bg-border"
                        aria-hidden
                    />
                ))}
            {thinkingText != null && (
                <MessageThinking
                    thinking={thinkingText}
                    status={message.status}
                    align="start"
                />
            )}
            <MessageContent message={message} onRetry={onRetry} />
        </div>
    );
}
