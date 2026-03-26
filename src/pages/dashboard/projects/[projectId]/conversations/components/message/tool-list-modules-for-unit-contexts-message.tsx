import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolListModulesForUnitContextsPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

type ContextModulesEntry = {
    context_slug: string;
    module_slugs: string[];
};

function getToolListModulesForUnitContextsPayload(message: ChatMessageWithDeliveryStatus): ContextModulesEntry[] {
    const p = message.payload as ToolListModulesForUnitContextsPayload | ContextModulesEntry[] | undefined | null;
    if (Array.isArray(p)) {
        return p.filter(
            (entry): entry is ContextModulesEntry =>
                entry != null &&
                typeof entry === "object" &&
                typeof (entry as ContextModulesEntry).context_slug === "string" &&
                Array.isArray((entry as ContextModulesEntry).module_slugs),
        );
    }
    const byContext = (p as ToolListModulesForUnitContextsPayload)?.by_context;
    return Array.isArray(byContext)
        ? byContext.filter(
              (entry): entry is ContextModulesEntry =>
                  entry != null &&
                  typeof entry === "object" &&
                  typeof entry.context_slug === "string" &&
                  Array.isArray(entry.module_slugs),
          )
        : [];
}

function getToolListModulesForUnitContextsArgs(
    message: ChatMessageWithDeliveryStatus,
): ToolListModulesForUnitContextsPayload["args"] | null {
    const p = message.payload as ToolListModulesForUnitContextsPayload | undefined | null;
    if (!p || Array.isArray(p)) return null;
    return p.args ?? null;
}

function formatListModulesForUnitContextsArgs(args: ToolListModulesForUnitContextsPayload["args"]): string {
    const contextSlugs = args?.context_slugs?.filter((s) => s.trim() !== "") ?? [];
    return contextSlugs.length > 0 ? `context_slugs: [${contextSlugs.join(", ")}]` : "—";
}

export function ToolListModulesForUnitContextsMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const rows = getToolListModulesForUnitContextsPayload(message);
    const args = getToolListModulesForUnitContextsArgs(message);
    const rowCount = rows.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasContent = rowCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload);

    const headerTooltip = (
        <TooltipContent side="top" className="max-w-xs">
            <span className="font-medium">Arguments</span>
            <span className="mt-0.5 block text-muted-foreground">
                {args ? formatListModulesForUnitContextsArgs(args) : "—"}
            </span>
        </TooltipContent>
    );

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasContent ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex max-w-full items-center gap-2 rounded-md py-3 pr-3 text-left">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className="text-sm font-medium">Reading modules for contexts</span>
                                <span className="text-xs text-muted-foreground">no content</span>
                            </div>
                        </TooltipTrigger>
                        {headerTooltip}
                    </Tooltip>
                ) : (
                    <Collapsible defaultOpen className="group/tool-list-modules-for-unit-contexts w-full min-w-0 max-w-full overflow-hidden">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CollapsibleTrigger className="flex items-center gap-2 rounded-md py-3 pr-3 text-left outline-none transition-all hover:bg-muted/50 hover:pl-3">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className="text-sm font-medium">Reading modules for contexts</span>
                                    <span className="text-xs text-muted-foreground">
                                        {rowCount} {rowCount === 1 ? "context" : "contexts"}
                                    </span>
                                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-list-modules-for-unit-contexts:rotate-180" />
                                </CollapsibleTrigger>
                            </TooltipTrigger>
                            {headerTooltip}
                        </Tooltip>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "min-w-0 max-w-full overflow-hidden outline-none",
                            )}
                        >
                            <div className="w-fit max-w-full min-w-0 py-1.5">
                                <div className="w-fit max-w-full overflow-x-auto rounded border">
                                    <Table unwrapped className="w-max max-w-full text-xs">
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="h-7 px-1.5 py-0.5 text-xs font-medium">
                                                    Context
                                                </TableHead>
                                                <TableHead className="h-7 px-1.5 py-0.5 text-xs font-medium">
                                                    Modules
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.context_slug} className="border-b last:border-0">
                                                    <TableCell className="px-1.5 py-1 align-top text-xs">
                                                        {row.context_slug}
                                                    </TableCell>
                                                    <TableCell className="whitespace-normal px-1.5 py-1 align-top text-xs">
                                                        {row.module_slugs.length > 0 ? (
                                                            <div className="flex w-max max-w-full min-w-0 flex-wrap gap-1">
                                                                {row.module_slugs.map((moduleSlug, idx) => (
                                                                    <Badge
                                                                        key={`${row.context_slug}-${idx}-${moduleSlug}`}
                                                                        variant="outline"
                                                                        className="px-1.5 py-0 text-[11px] font-normal leading-tight text-foreground"
                                                                    >
                                                                        {moduleSlug}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
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
