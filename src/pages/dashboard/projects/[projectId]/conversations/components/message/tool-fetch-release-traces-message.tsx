import type { ReactNode } from "react";
import { Activity, ChevronDownIcon, Package } from "lucide-react";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type TextMessageRequestedToolCall,
    type ToolFetchReleaseTracesPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessageArgsTooltipBlocks } from "./tool-message-args-tooltip-blocks";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const FETCH_RELEASE_TRACES_TOOL_NAME = "fetch_release_traces";

function trimArgString(value: unknown): string | null {
    if (value == null) return null;
    const s = String(value).trim();
    return s.length > 0 ? s : null;
}

function argsFromToolArgumentsToPass(raw: Record<string, unknown>): ToolFetchReleaseTracesPayload["args"] | null {
    const trace_id = trimArgString(raw.trace_id);
    const release_id = trimArgString(raw.release_id);
    if (trace_id == null && release_id == null) return null;
    return { trace_id, release_id };
}

function getToolFetchReleaseTracesArgs(message: ChatMessageWithDeliveryStatus): ToolFetchReleaseTracesPayload["args"] | null {
    const p = message.payload as
        | (ToolFetchReleaseTracesPayload & { requested_tool_calls?: TextMessageRequestedToolCall[] })
        | undefined
        | null;
    if (!p || Array.isArray(p)) return null;
    const fromArgs = p.args;
    if (fromArgs != null) {
        const normalized = argsFromToolArgumentsToPass(fromArgs as Record<string, unknown>);
        if (normalized != null) return normalized;
    }
    const calls = p.requested_tool_calls;
    if (!Array.isArray(calls)) return null;
    const call = calls.find((c) => c.tool_name === FETCH_RELEASE_TRACES_TOOL_NAME);
    if (call == null) return null;
    const pass = call.tool_arguments_to_pass;
    if (pass == null || typeof pass !== "object" || Array.isArray(pass)) return null;
    return argsFromToolArgumentsToPass(pass as Record<string, unknown>);
}

function getTraces(message: ChatMessageWithDeliveryStatus): unknown[] {
    const p = message.payload as ToolFetchReleaseTracesPayload | undefined | null;
    if (!p || Array.isArray(p)) return [];
    const t = (p as ToolFetchReleaseTracesPayload).traces;
    return Array.isArray(t) ? t : [];
}

function formatFetchReleaseTracesArgs(args: NonNullable<ToolFetchReleaseTracesPayload["args"]>): string {
    const parts: string[] = [];
    if (args.trace_id != null && String(args.trace_id).trim() !== "") parts.push(`trace_id: ${String(args.trace_id)}`);
    if (args.release_id != null && String(args.release_id).trim() !== "") parts.push(`release_id: ${String(args.release_id)}`);
    return parts.length ? parts.join(", ") : "—";
}

export function ToolFetchReleaseTracesMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const traces = getTraces(message);
    const args = getToolFetchReleaseTracesArgs(message);
    const traceCount = traces.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasTraces = traceCount > 0;
    const showNoTracesEmptyState = !hasTraces && status !== ChatMessageStatus.Generating;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const formattedArgs = args ? formatFetchReleaseTracesArgs(args) : "—";
    const traceIdLabel = trimArgString(args?.trace_id);
    const releaseIdLabel = trimArgString(args?.release_id);
    const argIdChips: { kind: "trace" | "release"; id: string }[] = [];
    if (traceIdLabel != null) argIdChips.push({ kind: "trace", id: traceIdLabel });
    if (releaseIdLabel != null) argIdChips.push({ kind: "release", id: releaseIdLabel });
    const hasArgIdChips = argIdChips.length > 0;

    const headerTooltip = (
        <TooltipContent side="top" className="max-w-xs">
            <ToolMessageArgsTooltipBlocks formattedArgs={formattedArgs} payloadRaw={message.payload_raw} />
        </TooltipContent>
    );

    let tracesBody = "";
    try {
        tracesBody = JSON.stringify(traces, null, 2);
    } catch {
        tracesBody = String(traces);
    }

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full flex-col justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasTraces ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex max-w-full min-w-0 flex-col gap-1.5 py-3 pr-3 text-left rounded-md">
                                <div className="flex max-w-full items-center gap-2">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className="font-medium text-sm">Fetching release traces</span>
                                    <span className="text-muted-foreground text-xs">
                                        {showNoTracesEmptyState ? "0 traces" : "Awaiting traces…"}
                                    </span>
                                </div>
                                {hasArgIdChips && (
                                    <div className="flex min-w-0 max-w-full flex-wrap content-start gap-x-2 gap-y-2 pb-0.5">
                                        {argIdChips.map(({ kind, id }) => (
                                            <CopyableEntityIdBadge
                                                key={kind}
                                                id={id}
                                                label={kind}
                                                leadingIcon={
                                                    kind === "trace" ? (
                                                        <Activity className="size-3" aria-hidden />
                                                    ) : (
                                                        <Package className="size-3" aria-hidden />
                                                    )
                                                }
                                                truncate={false}
                                                title={kind === "trace" ? "Click to copy trace_id" : "Click to copy release_id"}
                                                className="min-w-0 shrink-0 justify-start self-start"
                                            />
                                        ))}
                                    </div>
                                )}
                                {showNoTracesEmptyState && (
                                    <div className="mt-0.5 flex max-w-full items-center gap-1.5 rounded-md border border-dashed border-border/50 bg-muted/20 px-2 py-1.5">
                                        <Activity className="size-3 shrink-0 text-muted-foreground opacity-80" aria-hidden />
                                        <span className="text-xs font-normal leading-snug text-muted-foreground">No traces logged</span>
                                    </div>
                                )}
                            </div>
                        </TooltipTrigger>
                        {headerTooltip}
                    </Tooltip>
                ) : (
                    <Collapsible defaultOpen className="group/tool-release-traces w-full min-w-0 max-w-full overflow-hidden">
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger className="flex max-w-full min-w-0 items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                        <span className="shrink-0">
                                            <AiMessageStatusIcon status={status} />
                                        </span>
                                        <span className="font-medium text-sm">Fetching release traces</span>
                                        <span className="text-muted-foreground text-xs">
                                            {traceCount} {traceCount === 1 ? "trace" : "traces"}
                                        </span>
                                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-release-traces:rotate-180" />
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                {headerTooltip}
                            </Tooltip>
                            {hasArgIdChips && (
                                <div className="flex min-w-0 max-w-full flex-wrap content-start gap-x-2 gap-y-2 px-0 pr-3 pb-1">
                                    {argIdChips.map(({ kind, id }) => (
                                        <CopyableEntityIdBadge
                                            key={kind}
                                            id={id}
                                            label={kind}
                                            leadingIcon={
                                                kind === "trace" ? (
                                                    <Activity className="size-3" aria-hidden />
                                                ) : (
                                                    <Package className="size-3" aria-hidden />
                                                )
                                            }
                                            truncate={false}
                                            title={kind === "trace" ? "Click to copy trace_id" : "Click to copy release_id"}
                                            className="min-w-0 shrink-0 justify-start self-start"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "outline-none min-w-0 max-w-full overflow-hidden",
                            )}
                        >
                            <div className="min-w-0 max-w-full py-2">
                                <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs leading-relaxed">
                                    {tracesBody}
                                </pre>
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
