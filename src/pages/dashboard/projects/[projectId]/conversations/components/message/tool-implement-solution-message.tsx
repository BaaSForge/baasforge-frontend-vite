import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Markdown } from "@/components/markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolImplementSolutionPayload,
} from "@/modules/project-chat/types";

import { ToolNestedStepsPlaceholder } from "./generating-inline-placeholders";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolImplementSolutionArgsModalBody } from "./tool-analyze-tool-args-modal-bodies";
import { ToolDetailModalExpandButton, ToolDetailModalLayout } from "./tool-detail-modal-shell";
import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const ARGS_MODAL_TITLE = "Implement solution";

function parseToolImplementSolutionPayload(message: ChatMessageWithDeliveryStatus): ToolImplementSolutionPayload | null {
    const raw = message.payload;
    if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
    return raw as ToolImplementSolutionPayload;
}

export function ToolImplementSolutionMessage({ message, nestedMessages }: { message: ChatMessageWithDeliveryStatus; nestedMessages?: ReactNode }) {
    const [argsModalOpen, setArgsModalOpen] = useState(false);
    const payload = parseToolImplementSolutionPayload(message);
    const args = payload?.args;
    const detailedReport = typeof payload?.detailed_report === "string" ? payload.detailed_report : "";

    const status = message.status ?? ChatMessageStatus.Generating;
    const hasDetailedReport = detailedReport.trim().length > 0;
    const hasNestedMessages = nestedMessages != null;
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);

    return (
        <>
            <div className="w-full min-w-0 max-w-full">
                <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                    <Collapsible defaultOpen className="group/tool-impl w-full min-w-0 max-w-full overflow-hidden">
                        <div className="flex w-full min-w-0 max-w-full items-center gap-1">
                            <CollapsibleTrigger className="inline-flex min-w-0 max-w-full flex-1 items-center gap-2 py-3 pr-2 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className={toolHeaderPrimaryTitleClassName(status)}>Implementing solution</span>
                                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-impl:rotate-180" />
                            </CollapsibleTrigger>
                            <ToolDetailModalExpandButton
                                onClick={() => setArgsModalOpen(true)}
                                ariaLabel={`View ${ARGS_MODAL_TITLE} details`}
                            />
                        </div>
                        <ToolDetailModalLayout open={argsModalOpen} onOpenChange={setArgsModalOpen} title={ARGS_MODAL_TITLE}>
                            <ToolImplementSolutionArgsModalBody args={args} payloadRaw={message.payload_raw} />
                        </ToolDetailModalLayout>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "w-full min-w-0 max-w-full overflow-hidden outline-none",
                            )}
                        >
                            <div className="flex w-full min-w-0 flex-col gap-3 py-2">
                                <div className="min-h-12 w-full min-w-0 rounded-md border border-dashed border-border p-3" aria-label="Thoughts">
                                    {hasNestedMessages ? nestedMessages : <ToolNestedStepsPlaceholder />}
                                </div>
                                {hasDetailedReport && (
                                    <blockquote
                                        className={cn(
                                            "min-w-0 max-w-full border-l-2 border-muted pl-3 text-sm text-muted-foreground",
                                            "[&_p]:my-1 [&_pre]:text-xs [&_code]:text-xs",
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
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
        </>
    );
}
