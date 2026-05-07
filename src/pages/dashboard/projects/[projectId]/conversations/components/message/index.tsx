import { type ReactNode, useRef } from "react";

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
import { FinishImplementationMessage } from "./finish-implementation-message";
import { FinishObservabilityAnalysisMessage } from "./finish-observability-analysis-message";
import { FinishSolutionAnalysisMessage } from "./finish-solution-analysis-message";
import { ToolAnalyzeArchitectureMessage } from "./tool-analyze-architecture-message";
import { ToolAnalyzeObservabilityMessage } from "./tool-analyze-observability-message";
import { ToolAnalyzeSolutionMessage } from "./tool-analyze-solution-message";
import { ToolImplementSolutionMessage } from "./tool-implement-solution-message";
import { ToolFetchLatestReleasesMessage } from "./tool-fetch-latest-releases-message";
import { ToolFetchRelevantUnitsMessage } from "./tool-fetch-relevant-units-message";
import { ToolCreateUnitMessage } from "./tool-create-unit-message";
import { ToolModifyUnitMessage } from "./tool-modify-unit-message";
import { ToolRemoveUnitMessage } from "./tool-remove-unit-message";
import { ToolListUnitContextsMessage } from "./tool-list-unit-contexts-message";
import { ToolListModulesForUnitContextsMessage } from "./tool-list-modules-for-unit-contexts-message";
import { ReleaseControllerBoxMessage } from "./release-controller-box-message";
import { RejectControllerBoxMessage } from "./reject-controller-box-message";
import { getStickyMessageGroupForMessage, useStickyMessageRegistration } from "../sticky-messages";

type MessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    onSubmitMessageEdit?: (message: ChatMessageWithDeliveryStatus, newText: string) => Promise<void>;
    submittingEditMessageId?: string | null;
    isAnyMessageGenerating?: boolean;
    nestedMessages?: ReactNode;
    isNested?: boolean;
};

function MessageContent({
    message,
    onRetry,
    onSubmitMessageEdit,
    submittingEditMessageId,
    isAnyMessageGenerating,
    nestedMessages,
}: Omit<MessageProps, "isNested">) {
    if (message.type === ChatMessageType.Text) {
        return (
            <>
                <TextMessage
                    message={message}
                    onRetry={onRetry}
                    onSubmitMessageEdit={onSubmitMessageEdit}
                    isSubmittingEdit={submittingEditMessageId === message.id}
                    isAnyMessageGenerating={isAnyMessageGenerating}
                />
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
    if (message.type === ChatMessageType.ToolAnalyzeObservability) {
        return <ToolAnalyzeObservabilityMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.FinishObservabilityAnalysis) {
        return <FinishObservabilityAnalysisMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolAnalyzeSolution) {
        return <ToolAnalyzeSolutionMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.FinishSolutionAnalysis) {
        return <FinishSolutionAnalysisMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolImplementSolution) {
        return <ToolImplementSolutionMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.FinishImplementation) {
        return <FinishImplementationMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolCreateUnit) {
        return <ToolCreateUnitMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolModifyUnit) {
        return <ToolModifyUnitMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolRemoveUnit) {
        return <ToolRemoveUnitMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolListUnitContexts) {
        return <ToolListUnitContextsMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ToolListModulesForUnitContexts) {
        return <ToolListModulesForUnitContextsMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.ReleaseControllerBox) {
        return <ReleaseControllerBoxMessage message={message} nestedMessages={nestedMessages} />;
    }
    if (message.type === ChatMessageType.RejectControllerBox) {
        return (
            <RejectControllerBoxMessage message={message} nestedMessages={nestedMessages} />
        );
    }
    return nestedMessages != null ? <>{nestedMessages}</> : null;
}

const toolMessageTypes = [
    ChatMessageType.ToolFetchRelevantUnits,
    ChatMessageType.ToolFetchLatestReleases,
    ChatMessageType.ToolAnalyzeArchitecture,
    ChatMessageType.FinishArchitectureAnalysis,
    ChatMessageType.ToolAnalyzeObservability,
    ChatMessageType.FinishObservabilityAnalysis,
    ChatMessageType.ToolAnalyzeSolution,
    ChatMessageType.FinishSolutionAnalysis,
    ChatMessageType.ToolImplementSolution,
    ChatMessageType.FinishImplementation,
    ChatMessageType.ToolCreateUnit,
    ChatMessageType.ToolModifyUnit,
    ChatMessageType.ToolRemoveUnit,
    ChatMessageType.ToolListUnitContexts,
    ChatMessageType.ToolListModulesForUnitContexts,
    ChatMessageType.ReleaseControllerBox,
    ChatMessageType.RejectControllerBox,
];

export function Message({
    message,
    onRetry,
    onSubmitMessageEdit,
    submittingEditMessageId,
    isAnyMessageGenerating,
    nestedMessages,
    isNested,
}: MessageProps) {
    const isToolMessage = toolMessageTypes.includes(message.type);
    const isUser = message.role === ChatSessionRoleType.User;
    const thinkingText =
        !isUser && message.type === ChatMessageType.Text
            ? getTextPayloadThinkingDisplay(message.payload)
            : null;

    const stickyGroup = getStickyMessageGroupForMessage(message);
    const stickyAnchorRef = useRef<HTMLDivElement>(null);
    useStickyMessageRegistration(stickyGroup, message, stickyAnchorRef);

    return (
        <div
            ref={stickyAnchorRef}
            className={cn(
                "relative flex min-w-0 flex-col",
                isUser ? "items-end" : "items-start",
                isToolMessage && !isUser && "w-full",
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
            <MessageContent
                message={message}
                onRetry={onRetry}
                onSubmitMessageEdit={onSubmitMessageEdit}
                submittingEditMessageId={submittingEditMessageId}
                isAnyMessageGenerating={isAnyMessageGenerating}
                nestedMessages={nestedMessages}
            />
        </div>
    );
}

type MessageBranchProps = {
    message: ChatMessageWithDeliveryStatus;
    childrenByParentId: Map<string, ChatMessageWithDeliveryStatus[]>;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
    onSubmitMessageEdit?: (message: ChatMessageWithDeliveryStatus, newText: string) => Promise<void>;
    submittingEditMessageId?: string | null;
    isAnyMessageGenerating?: boolean;
    isNested?: boolean;
};

export function MessageBranch({
    message,
    childrenByParentId,
    onRetry,
    onSubmitMessageEdit,
    submittingEditMessageId,
    isAnyMessageGenerating,
    isNested,
}: MessageBranchProps) {
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
                        onSubmitMessageEdit={onSubmitMessageEdit}
                        submittingEditMessageId={submittingEditMessageId}
                        isAnyMessageGenerating={isAnyMessageGenerating}
                        isNested
                    />
                ))}
            </>
        ) : undefined;

    return (
        <Message
            message={message}
            onRetry={onRetry}
            onSubmitMessageEdit={onSubmitMessageEdit}
            submittingEditMessageId={submittingEditMessageId}
            isAnyMessageGenerating={isAnyMessageGenerating}
            nestedMessages={nested}
            isNested={isNested}
        />
    );
}
