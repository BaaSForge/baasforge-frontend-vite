import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolImplementSolutionPayload,
} from "@/modules/project-chat/types";

import { AiMessageStatusIcon } from "./message-icons";

function parseToolImplementSolutionPayload(
    message: ChatMessageWithDeliveryStatus,
): ToolImplementSolutionPayload | null {
    const raw = message.payload;
    if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
    return raw as ToolImplementSolutionPayload;
}

function formatArgsTooltip(args: ToolImplementSolutionPayload["args"] | undefined): string {
    const d = args?.directive;
    if (d != null && d !== "") return `directive: ${String(d)}`;
    return "—";
}

export function ToolImplementSolutionMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const payload = parseToolImplementSolutionPayload(message);
    const args = payload?.args;
    const detailedReport = typeof payload?.detailed_report === "string" ? payload.detailed_report : "";

    const status = message.status ?? ChatMessageStatus.Generating;
    const hasDetailedReport = detailedReport.trim().length > 0;
    const hasNestedMessages = nestedMessages != null;

    return (
        <div className="w-full min-w-0 max-w-full">
            <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                <Collapsible defaultOpen className="group/tool-impl w-full min-w-0 max-w-full overflow-hidden">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CollapsibleTrigger className="inline-flex max-w-full items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className="font-medium text-sm">Implementing solution</span>
                                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-impl:rotate-180" />
                            </CollapsibleTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <span className="font-medium">Arguments</span>
                            <span className="block mt-0.5 text-muted-foreground">{formatArgsTooltip(args)}</span>
                        </TooltipContent>
                    </Tooltip>
                    <CollapsibleContent
                        className={cn(
                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                            "w-full min-w-0 max-w-full overflow-hidden outline-none",
                        )}
                    >
                        <div className="flex w-full min-w-0 flex-col gap-3 py-2">
                            <div
                                className="min-h-12 w-full min-w-0 rounded-md border border-dashed border-border p-3"
                                aria-label="Thoughts"
                            >
                                {hasNestedMessages ? nestedMessages : <Spinner className="size-3.5 text-muted-foreground" />}
                            </div>
                            {hasDetailedReport && (
                                <blockquote
                                    className={cn(
                                        "min-w-0 max-w-full border-l-2 border-muted pl-3 text-sm text-muted-foreground",
                                        "[&_p]:my-1 [&_pre]:my-2 [&_pre]:text-xs [&_code]:text-xs",
                                    )}
                                >
                                    <Markdown className="max-w-none">{detailedReport}</Markdown>
                                </blockquote>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
}
