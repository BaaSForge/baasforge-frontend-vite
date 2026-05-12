"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { relevantUnitIdStringsFromToolArgs } from "@/modules/project-chat/payloads";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type FinishObservabilityAnalysisPayload,
} from "@/modules/project-chat/types";
import { truncateToWords } from "@/utils/truncate-to-words";

import { AiMessageStatusIcon } from "./message-icons";
import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { ToolMessageArgsTooltipBlocks } from "./tool-message-args-tooltip-blocks";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const SUMMARY_MAX_WORDS = 30;

function formatArgs(args: FinishObservabilityAnalysisPayload["args"]): string {
    const parts: string[] = [];
    if (args?.detailed_report != null && args.detailed_report !== "") {
        parts.push(`detailed report: ${truncateToWords(String(args.detailed_report), SUMMARY_MAX_WORDS)}`);
    }
    const n = relevantUnitIdStringsFromToolArgs(args).length;
    if (n > 0) parts.push(`relevant units count: ${n}`);
    return parts.length ? parts.join("\n") : "—";
}

export function FinishObservabilityAnalysisMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const status = message.status ?? ChatMessageStatus.Generating;
    const payload = message?.payload as FinishObservabilityAnalysisPayload | undefined | null;
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
                            <span className={toolHeaderPrimaryTitleClassName(status)}>Finished observability analysis</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <span className="font-medium">Observability analysis finished</span>
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
