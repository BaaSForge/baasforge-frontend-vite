import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type FinishArchitectureAnalysisPayload,
} from "@/modules/project-chat/types";
import { truncateToWords } from "@/utils/truncate-to-words";

import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessageArgsTooltipBlocks } from "./tool-message-args-tooltip-blocks";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const SUMMARY_MAX_WORDS = 30;

function formatArgs(args: FinishArchitectureAnalysisPayload["args"]): string {
    const parts: string[] = [];
    if (args?.detailed_report != null && args.detailed_report !== "") {
        parts.push(`detailed report: ${truncateToWords(String(args.detailed_report), SUMMARY_MAX_WORDS)}`);
    }
    if (args?.relevant_units_ids != null && args.relevant_units_ids.length > 0) parts.push(`relevant units count: ${args.relevant_units_ids.length}`);
    return parts.length ? parts.join("\n") : "—";
}

export function FinishArchitectureAnalysisMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const status = message.status ?? ChatMessageStatus.Generating;
    const payload = message?.payload as FinishArchitectureAnalysisPayload | undefined | null;
    const args = payload?.args ?? null;
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const formattedArgs = args ? formatArgs(args) : "—";

    return (
        <>
            <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md transition-all">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <span className="font-medium text-sm">Finished Architecture analysis</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <span className="font-medium">Architecture analysis finished</span>
                        <ToolMessageArgsTooltipBlocks
                            formattedArgs={formattedArgs}
                            payloadRaw={message.payload_raw}
                            omitParsedArgumentsHeading
                        />
                    </TooltipContent>
                </Tooltip>
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
