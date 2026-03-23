import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type FinishArchitectureAnalysisPayload,
} from "@/modules/project-chat/types";

import { AiMessageStatusIcon } from "./message-icons";

function formatArgs(args: FinishArchitectureAnalysisPayload["args"]): string {
    const parts: string[] = [];
    if (args?.summary != null && args.summary !== "") parts.push(`summary: ${String(args.summary)}`);
    if (args?.relevant_units_ids != null && args.relevant_units_ids.length > 0) parts.push(`relevant units count: ${args.relevant_units_ids.length}`);
    return parts.length ? parts.join(", ") : "—";
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
                        <span className="block mt-0.5 text-muted-foreground">{args ? formatArgs(args) : "—"}</span>
                    </TooltipContent>
                </Tooltip>
            </div>
            {nestedMessages}
        </>
    );
}
