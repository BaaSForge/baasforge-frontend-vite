import { Activity, Package } from "lucide-react";
import type { ReactNode } from "react";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Markdown } from "@/components/markdown";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
    ToolAnalyzeArchitecturePayload,
    ToolAnalyzeObservabilityPayload,
    ToolAnalyzeSolutionPayload,
    ToolImplementSolutionPayload,
    ToolMessagePayloadRaw,
} from "@/modules/project-chat/types";

function readRawArgumentsFromPayloadRaw(payloadRaw: unknown): unknown | undefined {
    if (payloadRaw == null || typeof payloadRaw !== "object" || Array.isArray(payloadRaw)) return undefined;
    if (!Object.prototype.hasOwnProperty.call(payloadRaw, "raw_arguments")) return undefined;
    return (payloadRaw as ToolMessagePayloadRaw).raw_arguments;
}

function rawArgumentsAsMarkdownFencedJson(raw: unknown): string | null {
    if (raw === undefined) return null;
    try {
        const body = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
        if (body.trim() === "") return null;
        return `\`\`\`json\n${body}\n\`\`\``;
    } catch {
        return `\`\`\`\n${String(raw)}\n\`\`\``;
    }
}

function ArgField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <Label className="text-muted-foreground shrink-0">{label}</Label>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function MarkdownBlock({ markdown }: { markdown: string }) {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none")}>
            <Markdown>{markdown}</Markdown>
        </div>
    );
}

function RawArgumentsMarkdownFallback({ payloadRaw }: { payloadRaw: unknown }) {
    const raw = readRawArgumentsFromPayloadRaw(payloadRaw);
    const md = rawArgumentsAsMarkdownFencedJson(raw);
    if (md == null) return null;
    return (
        <ArgField label="Raw arguments">
            <MarkdownBlock markdown={md} />
        </ArgField>
    );
}

function EmptyPlaceholder() {
    return <p className="text-muted-foreground text-sm">No arguments</p>;
}

export function ToolAnalyzeSolutionArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolAnalyzeSolutionPayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const intent = args?.intent != null && String(args.intent).trim() !== "" ? String(args.intent) : null;
    if (intent == null) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <ArgField label="Intent">
                <MarkdownBlock markdown={intent} />
            </ArgField>
        </div>
    );
}

export function ToolAnalyzeArchitectureArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolAnalyzeArchitecturePayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const intent = args?.intent != null && String(args.intent).trim() !== "" ? String(args.intent) : null;
    if (intent == null) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <ArgField label="Intent">
                <MarkdownBlock markdown={intent} />
            </ArgField>
        </div>
    );
}

export function ToolAnalyzeObservabilityArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolAnalyzeObservabilityPayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const brief = args?.brief != null && String(args.brief).trim() !== "" ? String(args.brief) : null;
    const traceId = args?.trace_id != null && String(args.trace_id).trim() !== "" ? String(args.trace_id) : null;
    const releaseId = args?.release_id != null && String(args.release_id).trim() !== "" ? String(args.release_id) : null;
    const hasStructured = brief != null || traceId != null || releaseId != null;
    if (!hasStructured) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            {brief != null ? (
                <ArgField label="Brief">
                    <MarkdownBlock markdown={brief} />
                </ArgField>
            ) : null}
            {traceId != null ? (
                <ArgField label="Trace id">
                    <CopyableEntityIdBadge
                        id={traceId}
                        label="trace"
                        leadingIcon={<Activity className="size-3" aria-hidden />}
                        truncate={false}
                        title="Click to copy trace_id"
                        className="min-w-0 shrink-0 justify-start self-start"
                    />
                </ArgField>
            ) : null}
            {releaseId != null ? (
                <ArgField label="Release id">
                    <CopyableEntityIdBadge
                        id={releaseId}
                        label="release"
                        leadingIcon={<Package className="size-3" aria-hidden />}
                        truncate={false}
                        title="Click to copy release_id"
                        className="min-w-0 shrink-0 justify-start self-start"
                    />
                </ArgField>
            ) : null}
        </div>
    );
}

export function ToolImplementSolutionArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolImplementSolutionPayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const directive = args?.directive != null && String(args.directive).trim() !== "" ? String(args.directive) : null;
    if (directive == null) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <ArgField label="Directive">
                <MarkdownBlock markdown={directive} />
            </ArgField>
        </div>
    );
}
