import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useParams } from "react-router";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardChip } from "@/modules/project";
import { useChatSessionEmbeddedUnitsLatestRevisions } from "@/modules/project-chat/use-chat-session-embedded-units-latest-revisions";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolFetchRelevantUnitsPayload,
} from "@/modules/project-chat/types";

import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessageArgsTooltipBlocks } from "./tool-message-args-tooltip-blocks";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

function getToolFetchRelevantUnitsPayload(message: ChatMessageWithDeliveryStatus): ProjectUnitResponse[] {
    const p = message.payload as ToolFetchRelevantUnitsPayload | ProjectUnitResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ProjectUnitResponse[];
    }
    const units = (p as ToolFetchRelevantUnitsPayload)?.units;
    return Array.isArray(units) ? (units as ProjectUnitResponse[]) : [];
}

function getToolFetchRelevantUnitsArgs(message: ChatMessageWithDeliveryStatus): ToolFetchRelevantUnitsPayload["args"] | null {
    const p = message.payload as ToolFetchRelevantUnitsPayload | undefined | null;
    if (!p || Array.isArray(p)) return null;
    return p.args ?? null;
}

function formatRelevantUnitsArgs(args: ToolFetchRelevantUnitsPayload["args"]): string {
    const parts: string[] = [];
    if (args.query != null && args.query !== "") parts.push(`query: ${String(args.query)}`);
    return parts.length ? parts.join(", ") : "—";
}

export function ToolFetchRelevantUnitsMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const { projectId, conversationId: chatSessionId } = useParams<{ projectId: string; conversationId?: string }>();
    const units = getToolFetchRelevantUnitsPayload(message);
    const shouldRefreshFromHistory = message.status !== ChatMessageStatus.Generating;
    const { units: displayUnits, isRefreshing } = useChatSessionEmbeddedUnitsLatestRevisions(
        projectId,
        chatSessionId,
        units,
        shouldRefreshFromHistory,
    );
    const args = getToolFetchRelevantUnitsArgs(message);
    const unitCount = units.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasUnits = unitCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const formattedArgs = args ? formatRelevantUnitsArgs(args) : "—";

    const headerTooltip = (
        <TooltipContent side="top" className="max-w-xs">
            <ToolMessageArgsTooltipBlocks formattedArgs={formattedArgs} payloadRaw={message.payload_raw} />
        </TooltipContent>
    );

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasUnits ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex max-w-full items-center gap-2 py-3 pr-3 text-left rounded-md">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className={toolHeaderPrimaryTitleClassName(status)}>Reading relevant units</span>
                                <span className="text-muted-foreground text-xs">No content</span>
                            </div>
                        </TooltipTrigger>
                        {headerTooltip}
                    </Tooltip>
                ) : (
                    <Collapsible defaultOpen className="group/tool-units w-full min-w-0 max-w-full overflow-hidden">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CollapsibleTrigger className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className={toolHeaderPrimaryTitleClassName(status)}>Reading relevant units</span>
                                    <span className="text-muted-foreground text-xs">
                                        {unitCount} {unitCount === 1 ? "unit" : "units"}
                                    </span>
                                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-units:rotate-180" />
                                </CollapsibleTrigger>
                            </TooltipTrigger>
                            {headerTooltip}
                        </Tooltip>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "outline-none min-w-0 max-w-full overflow-hidden",
                            )}
                        >
                            <div className="min-w-0 w-full max-w-full overflow-hidden py-2">
                                <FadedScrollArea
                                    orientation="horizontal"
                                    horizontalIntrinsicHeight
                                    className="min-h-0 min-w-0 w-full max-w-full"
                                    hideScrollbar
                                >
                                    <div className="flex w-max items-stretch gap-2">
                                        {displayUnits.map((unit) => (
                                            <UnitCardChip
                                                key={unit.id}
                                                projectId={projectId}
                                                chatSessionId={chatSessionId}
                                                unit={unit}
                                                unitRefreshPending={isRefreshing}
                                            />
                                        ))}
                                    </div>
                                </FadedScrollArea>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
