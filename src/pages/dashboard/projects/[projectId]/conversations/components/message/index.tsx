import { cn } from "@/lib/utils";
import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

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

export function Message({ message, onRetry }: MessageProps) {
    const isInvokedByAnother = Boolean(message.invoking_message_id);

    return (
        <div
            className={cn(
                "relative min-w-0",
                isInvokedByAnother && "ml-12",
            )}
        >
            {isInvokedByAnother && (
                <span
                    className="absolute top-0 -left-12 w-12 h-px bg-border"
                    aria-hidden
                />
            )}
            <MessageContent message={message} onRetry={onRetry} />
        </div>
    );
}
