import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
    ChatMessageType,
    ChatSessionRoleType,
    getTextPayloadThinkingDisplay,
    type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";

import { MessageThinking } from "./message-thinking";
import { TextMessage } from "./text-message";
import { FinishArchitectureAnalysisMessage } from "./finish-architecture-analysis-message";
import { ToolAnalyzeArchitectureMessage } from "./tool-analyze-architecture-message";
import { ToolFetchLatestReleasesMessage } from "./tool-fetch-latest-releases-message";
import { ToolFetchRelevantUnitsMessage } from "./tool-fetch-relevant-units-message";

type MessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    nestedMessages?: ReactNode;
    isNested?: boolean;
};

function MessageContent({ message, onRetry, nestedMessages }: Omit<MessageProps, "isNested">) {
    if (message.type === ChatMessageType.Text) {
        return (
            <>
                <TextMessage message={message} onRetry={onRetry} />
                {nestedMessages}
            </>
        );
    }
    if (message.type === ChatMessageType.ToolFetchRelevantUnits) {
        return <ToolFetchRelevantUnitsMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolFetchLatestReleases) {
        return <ToolFetchLatestReleasesMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolAnalyzeArchitecture) {
        return <ToolAnalyzeArchitectureMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.FinishArchitectureAnalysis) {
        return <FinishArchitectureAnalysisMessage message={message} nestedMessages={nestedMessages} />;
    }
    return nestedMessages != null ? <>{nestedMessages}</> : null;
}

const toolMessageTypes = [
    ChatMessageType.ToolFetchRelevantUnits,
    ChatMessageType.ToolFetchLatestReleases,
    ChatMessageType.ToolAnalyzeArchitecture,
    ChatMessageType.FinishArchitectureAnalysis,
];

export function Message({ message, onRetry, nestedMessages, isNested }: MessageProps) {
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
                isToolMessage && !isNested && "mt-2",
            )}
        >
            {thinkingText != null && (
                <MessageThinking
                    thinking={thinkingText}
                    status={message.status}
                    align="start"
                />
            )}
            <MessageContent message={message} onRetry={onRetry} nestedMessages={nestedMessages} />
        </div>
    );
}

type MessageBranchProps = {
    message: ChatMessageWithDeliveryStatus;
    childrenByParentId: Map<string, ChatMessageWithDeliveryStatus[]>;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    isNested?: boolean;
};

export function MessageBranch({ message, childrenByParentId, onRetry, isNested }: MessageBranchProps) {
    const childMsgs = childrenByParentId.get(message.id) ?? [];
    const nested =
        childMsgs.length > 0 ? (
            <>
                {childMsgs.map((child) => (
                    <MessageBranch
                        key={child.id}
                        message={child}
                        childrenByParentId={childrenByParentId}
                        onRetry={onRetry}
                        isNested
                    />
                ))}
            </>
        ) : undefined;

    return <Message message={message} onRetry={onRetry} nestedMessages={nested} isNested={isNested} />;
}

export { partitionMessagesByInvokingParent } from "./partition-invoked-messages";
