import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { TextMessage } from "./text-message";
import { ToolFetchRelevantUnitsMessage } from "./tool-fetch-relevant-units-message";

type MessageProps = {
    message: ChatMessageWithDeliveryStatus;
    onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

export function Message({ message, onRetry }: MessageProps) {
    if (message.type === ChatMessageType.Text) {
        return <TextMessage message={message} onRetry={onRetry} />;
    }
    if (message.type === ChatMessageType.ToolFetchRelevantUnits) {
        return <ToolFetchRelevantUnitsMessage message={message} />;
    }
    return null;
}
