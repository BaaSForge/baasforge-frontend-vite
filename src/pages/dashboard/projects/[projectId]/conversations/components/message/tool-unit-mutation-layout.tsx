import type { ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardCompact } from "@/modules/project";
import { useChatSessionEmbeddedUnitsLatestRevisions } from "@/modules/project-chat/use-chat-session-embedded-units-latest-revisions";
import { ChatMessageStatus, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessageArgsTooltipBlocks } from "./tool-message-args-tooltip-blocks";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

export type ToolUnitMutationLayoutProps = {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
    statusLine: string;
    argsTooltip: string;
    unit: ProjectUnitResponse | null;
    payloadError?: string | null;
};

export function ToolUnitMutationLayout({
    message,
    nestedMessages,
    statusLine,
    argsTooltip,
    unit,
    payloadError,
}: ToolUnitMutationLayoutProps) {
    const { projectId, conversationId: chatSessionId } = useParams<{ projectId: string; conversationId?: string }>();
    const initialUnits = useMemo(() => (unit != null ? [unit] : []), [unit]);
    const shouldRefreshFromHistory = message.status !== ChatMessageStatus.Generating;
    const { units: refreshedUnits, isRefreshing } = useChatSessionEmbeddedUnitsLatestRevisions(
        projectId,
        chatSessionId,
        initialUnits,
        shouldRefreshFromHistory && unit != null,
    );
    const displayUnit = refreshedUnits[0] ?? unit;

    const status = message.status ?? ChatMessageStatus.Generating;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const hasUnit = displayUnit != null;

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                <div className="flex min-w-0 flex-1 flex-col gap-2 py-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex min-w-0 max-w-full cursor-default items-center gap-2 self-start text-left">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <p className="min-w-0 text-sm text-muted-foreground">{statusLine}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <ToolMessageArgsTooltipBlocks formattedArgs={argsTooltip} payloadRaw={message.payload_raw} />
                        </TooltipContent>
                    </Tooltip>
                    {hasUnit && displayUnit != null && (
                        <div className="w-fit max-w-full min-w-0 self-start">
                            <UnitCardCompact
                                className="w-auto"
                                projectId={projectId}
                                chatSessionId={chatSessionId}
                                unit={displayUnit}
                                unitRefreshPending={isRefreshing}
                            />
                        </div>
                    )}
                </div>
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
