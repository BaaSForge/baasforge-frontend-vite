import type { ReactNode } from "react";
import { useState } from "react";
import { Activity, Braces, ChevronDownIcon, Package } from "lucide-react";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { SpanJsonModal } from "@/components/span-json-modal";
import { Button } from "@/components/ui/button";
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

function getSpans(message: ChatMessageWithDeliveryStatus): unknown[] {
    const p = message.payload as ToolFetchReleaseTracesPayload | undefined | null;
    if (!p || Array.isArray(p)) return [];
    const s = (p as ToolFetchReleaseTracesPayload).spans;
    return Array.isArray(s) ? s : [];
}

/** Jaeger-style span `duration` field: whole microseconds. */
function formatSpanDurationMicros(micros: number): string {
    if (!Number.isFinite(micros) || micros < 0) return "—";
    if (micros === 0) return "0";

    const ms = micros / 1000;
    const s = ms / 1000;
    const m = s / 60;
    const h = m / 60;

    const trimTrailingZeros = (n: number, decimals: number) => {
        const t = n.toFixed(decimals).replace(/\.?0+$/, "");
        return t === "" || t === "-" ? "0" : t;
    };

    if (h >= 1) return `${trimTrailingZeros(h, 1)} h`;
    if (m >= 1) return `${trimTrailingZeros(m, 1)} min`;
    if (s >= 1) return `${s >= 10 ? String(Math.round(s)) : trimTrailingZeros(s, 2)} s`;
    if (ms >= 1) return `${ms >= 10 ? String(Math.round(ms)) : trimTrailingZeros(ms, 2)} ms`;
    if (micros >= 1) return `${micros < 10 ? trimTrailingZeros(micros, 2) : String(Math.round(micros))} µs`;
    return "<1 µs";
}

function spanRowFields(span: unknown): { duration: string; durationRawTitle: string | null; spanId: string; tagCount: number } {
    if (span == null || typeof span !== "object" || Array.isArray(span)) {
        return { duration: "—", durationRawTitle: null, spanId: "—", tagCount: 0 };
    }
    const o = span as Record<string, unknown>;
    const dur = o.duration;
    const hasDur = typeof dur === "number" && Number.isFinite(dur);
    const duration = hasDur ? formatSpanDurationMicros(dur) : "—";
    const durationRawTitle = hasDur ? `${dur} µs` : null;
    const sid = o.spanID;
    const spanId = typeof sid === "string" && sid.length > 0 ? sid : "—";
    const tags = o.tags;
    const tagCount = Array.isArray(tags) ? tags.length : 0;
    return { duration, durationRawTitle, spanId, tagCount };
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
    const [spanModalOpen, setSpanModalOpen] = useState(false);
    const [modalSpan, setModalSpan] = useState<unknown | null>(null);

    const spans = getSpans(message);
    const args = getToolFetchReleaseTracesArgs(message);
    const spanCount = spans.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasSpans = spanCount > 0;
    const showNoSpansEmptyState = !hasSpans && status !== ChatMessageStatus.Generating;
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
        <TooltipContent side="top" align="start" className="max-w-xs">
            <ToolMessageArgsTooltipBlocks formattedArgs={formattedArgs} payloadRaw={message.payload_raw} />
        </TooltipContent>
    );

    const openSpanModal = (span: unknown) => {
        setModalSpan(span);
        setSpanModalOpen(true);
    };

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full flex-col justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasSpans ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex max-w-full min-w-0 flex-col gap-1.5 py-3 pr-3 text-left rounded-md">
                                <div className="flex max-w-full items-center gap-2">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className="font-medium text-sm">Fetching release traces</span>
                                    <span className="text-muted-foreground text-xs">
                                        {showNoSpansEmptyState ? "0 spans" : "Awaiting spans…"}
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
                                {showNoSpansEmptyState && (
                                    <div className="mt-0.5 flex max-w-full items-center gap-1.5 rounded-md border border-dashed border-border/50 bg-muted/20 px-2 py-1.5">
                                        <Activity className="size-3 shrink-0 text-muted-foreground opacity-80" aria-hidden />
                                        <span className="text-xs font-normal leading-snug text-muted-foreground">No spans</span>
                                    </div>
                                )}
                            </div>
                        </TooltipTrigger>
                        {headerTooltip}
                    </Tooltip>
                ) : (
                    <Collapsible defaultOpen className="group/tool-release-spans w-full min-w-0 max-w-full overflow-hidden">
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger className="flex max-w-full min-w-0 items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                        <span className="shrink-0">
                                            <AiMessageStatusIcon status={status} />
                                        </span>
                                        <span className="font-medium text-sm">Fetching release traces</span>
                                        <span className="text-muted-foreground text-xs">
                                            {spanCount} {spanCount === 1 ? "span" : "spans"}
                                        </span>
                                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-release-spans:rotate-180" />
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
                            <div className="min-w-0 max-w-full py-2 pl-2 pr-3">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-xs text-muted-foreground">
                                            <th className="py-1.5 pl-2.5 pr-3 font-medium tabular-nums">Duration</th>
                                            <th className="min-w-0 py-1.5 pr-3 font-medium">Span ID</th>
                                            <th className="w-16 py-1.5 pl-2 pr-3 text-right font-medium">Tags</th>
                                            <th className="shrink-0 py-1.5 pl-5 pr-4 text-right font-medium">
                                                <span className="sr-only">Details</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {spans.map((span, index) => {
                                            const { duration, durationRawTitle, spanId, tagCount } = spanRowFields(span);
                                            const rowKey = spanId !== "—" ? spanId : `span-${index}`;
                                            return (
                                                <tr
                                                    key={rowKey}
                                                    className="cursor-pointer border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/40"
                                                    onClick={() => openSpanModal(span)}
                                                >
                                                    <td
                                                        className="py-2 pl-2.5 pr-3 font-mono text-xs tabular-nums align-top"
                                                        title={durationRawTitle ?? undefined}
                                                    >
                                                        {duration}
                                                    </td>
                                                    <td
                                                        className="max-w-[min(12rem,40vw)] truncate py-2 pr-3 font-mono text-xs align-top"
                                                        title={spanId}
                                                    >
                                                        {spanId}
                                                    </td>
                                                    <td className="py-2 pl-2 pr-3 text-right text-xs text-muted-foreground align-top tabular-nums">
                                                        {tagCount}
                                                    </td>
                                                    <td className="py-1.5 pl-5 pr-4 text-right align-middle">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            className="ml-auto h-5 min-h-5 gap-1.5 px-1.5 py-0 text-[10px] leading-none font-medium shadow-none [&_svg]:size-2.5"
                                                            aria-label="View span details and logs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openSpanModal(span);
                                                            }}
                                                        >
                                                            <Braces aria-hidden className="size-2.5 shrink-0 stroke-[1.75]" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
            <SpanJsonModal
                open={spanModalOpen}
                onOpenChange={setSpanModalOpen}
                span={modalSpan}
            />
        </>
    );
}
