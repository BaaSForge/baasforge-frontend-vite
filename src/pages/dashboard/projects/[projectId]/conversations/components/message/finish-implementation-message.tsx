import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type FinishImplementationPayload,
} from "@/modules/project-chat/types";
import { truncateToWords } from "@/utils/truncate-to-words";

import { AiMessageStatusIcon } from "./message-icons";

const SUMMARY_MAX_WORDS = 30;

function formatArgs(args: FinishImplementationPayload["args"]): string {
    const parts: string[] = [];
    const text = args?.implementation_summary;
    if (text != null && text !== "") {
        parts.push(`implementation summary: ${truncateToWords(String(text), SUMMARY_MAX_WORDS)}`);
    }
    return parts.length ? parts.join("\n") : "—";
}

export function FinishImplementationMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const status = message.status ?? ChatMessageStatus.Generating;
    const payload = message?.payload as FinishImplementationPayload | undefined | null;
    const args = payload?.args ?? null;

    return (
        <>
            <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md transition-all">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <span className="font-medium text-sm">Finished implementation</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <span className="font-medium">Implementation finished</span>
                        <span className="block mt-0.5 whitespace-pre-line text-muted-foreground">{args ? formatArgs(args) : "—"}</span>
                    </TooltipContent>
                </Tooltip>
            </div>
            {nestedMessages}
        </>
    );
}
