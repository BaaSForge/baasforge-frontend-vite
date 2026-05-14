import type { ReactNode } from "react";

import { Markdown } from "@/components/markdown";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UnitExplanationCurrentViewer } from "@/modules/project-chat/components/unit-explanation-current-viewer";
import type {
    ToolCreateUnitPayload,
    ToolMessagePayloadRaw,
    ToolModifyUnitPayload,
    ToolRemoveUnitPayload,
} from "@/modules/project-chat/types";

function readRawArgumentsFromPayloadRaw(payloadRaw: unknown): unknown | undefined {
    if (payloadRaw == null || typeof payloadRaw !== "object" || Array.isArray(payloadRaw)) return undefined;
    if (!Object.prototype.hasOwnProperty.call(payloadRaw, "raw_arguments")) return undefined;
    return (payloadRaw as ToolMessagePayloadRaw).raw_arguments;
}

function rawArgumentsJsonString(raw: unknown): string | null {
    if (raw === undefined) return null;
    try {
        return typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
    } catch {
        return String(raw);
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

function RawArgumentsFallback({ payloadRaw }: { payloadRaw: unknown }) {
    const raw = readRawArgumentsFromPayloadRaw(payloadRaw);
    const json = rawArgumentsJsonString(raw);
    if (json == null || json.trim() === "") return null;
    return (
        <ArgField label="Raw arguments">
            <UnitExplanationCurrentViewer code={json} language="json" plainText={false} />
        </ArgField>
    );
}

function EmptyPlaceholder() {
    return <p className="text-muted-foreground text-sm">No arguments</p>;
}

function ExplanationNoteField({ explanation }: { explanation: string }) {
    return (
        <ArgField label="Explanation">
            <div className={cn("prose prose-sm dark:prose-invert max-w-none")}>
                <Markdown>{explanation}</Markdown>
            </div>
        </ArgField>
    );
}

export function CreateUnitArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolCreateUnitPayload["args"] | undefined;
    payloadRaw: unknown;
}) {
    const hasUnitType = args?.unit_type != null && String(args.unit_type).trim() !== "";
    const hasCode = args?.code != null && String(args.code).trim() !== "";
    const hasExplanation = args?.explanation != null && String(args.explanation).trim() !== "";
    const structured = hasUnitType || hasCode || hasExplanation;

    if (!structured) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {hasUnitType ? (
                <ArgField label="Unit type">
                    <p className="text-foreground text-sm leading-relaxed">{String(args!.unit_type)}</p>
                </ArgField>
            ) : null}
            {hasCode ? (
                <ArgField label="Code">
                    <UnitExplanationCurrentViewer code={String(args!.code)} language="typescript" plainText={false} />
                </ArgField>
            ) : null}
            {hasExplanation ? <ExplanationNoteField explanation={String(args!.explanation)} /> : null}
        </div>
    );
}

export function RemoveUnitArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolRemoveUnitPayload["args"] | undefined;
    payloadRaw: unknown;
}) {
    const hasUnitId = args?.unit_id != null && String(args.unit_id).trim() !== "";
    if (!hasUnitId) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <ArgField label="Unit id">
                <p className="font-mono text-foreground text-sm leading-relaxed">{String(args!.unit_id)}</p>
            </ArgField>
        </div>
    );
}

export function ModifyUnitArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolModifyUnitPayload["args"] | undefined;
    payloadRaw: unknown;
}) {
    const hasUnitId = args?.unit_id != null && String(args.unit_id).trim() !== "";
    const hasRevision = args?.revision != null && String(args.revision).trim() !== "";
    const hasCode = args?.code != null && String(args.code).trim() !== "";
    const hasExplanation = args?.explanation != null && String(args.explanation).trim() !== "";
    const structured = hasUnitId || hasRevision || hasCode || hasExplanation;

    if (!structured) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {hasUnitId ? (
                <ArgField label="Unit id">
                    <p className="font-mono text-foreground text-sm leading-relaxed">{String(args!.unit_id)}</p>
                </ArgField>
            ) : null}
            {hasRevision ? (
                <ArgField label="Revision">
                    <p className="font-mono text-foreground text-sm leading-relaxed">{String(args!.revision)}</p>
                </ArgField>
            ) : null}
            {hasCode ? (
                <ArgField label="Code">
                    <UnitExplanationCurrentViewer code={String(args!.code)} language="typescript" plainText={false} />
                </ArgField>
            ) : null}
            {hasExplanation ? <ExplanationNoteField explanation={String(args!.explanation)} /> : null}
        </div>
    );
}
