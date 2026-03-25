import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolListUnitContextsPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";

function getToolListUnitContextsPayload(message: ChatMessageWithDeliveryStatus): string[] {
    const p = message.payload as ToolListUnitContextsPayload | string[] | undefined | null;
    if (Array.isArray(p)) return p.filter((v): v is string => typeof v === "string");
    const contextSlugs = (p as ToolListUnitContextsPayload)?.context_slugs;
    return Array.isArray(contextSlugs) ? contextSlugs.filter((v): v is string => typeof v === "string") : [];
}

export function ToolListUnitContextsMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const contextSlugs = getToolListUnitContextsPayload(message);
    const contextCount = contextSlugs.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasContent = contextCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasContent ? (
                    <div className="flex max-w-full items-center gap-2 rounded-md py-3 pr-3 text-left">
                        <span className="shrink-0">
                            <AiMessageStatusIcon status={status} />
                        </span>
                        <span className="text-sm font-medium">Reading unit contexts</span>
                        <span className="text-xs text-muted-foreground">no content</span>
                    </div>
                ) : (
                    <Collapsible defaultOpen className="group/tool-list-unit-contexts w-full min-w-0 max-w-full overflow-hidden">
                        <CollapsibleTrigger className="flex items-center gap-2 rounded-md py-3 pr-3 text-left outline-none transition-all hover:bg-muted/50 hover:pl-3">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <span className="text-sm font-medium">Reading unit contexts</span>
                            <span className="text-xs text-muted-foreground">
                                {contextCount} {contextCount === 1 ? "context" : "contexts"}
                            </span>
                            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-list-unit-contexts:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "min-w-0 max-w-full overflow-hidden outline-none",
                            )}
                        >
                            <div className="w-fit max-w-full min-w-0 py-1.5">
                                <div className="w-fit max-w-full rounded border p-1.5">
                                    <div className="flex w-fit max-w-full min-w-0 flex-wrap gap-1">
                                        {contextSlugs.map((contextSlug) => (
                                            <Badge
                                                key={contextSlug}
                                                variant="outline"
                                                className="px-1.5 py-0 text-[11px] font-normal leading-tight text-foreground"
                                            >
                                                {contextSlug}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            {nestedMessages}
        </>
    );
}
