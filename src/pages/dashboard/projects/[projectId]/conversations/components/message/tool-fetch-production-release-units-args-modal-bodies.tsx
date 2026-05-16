import type { ReactNode } from "react";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Markdown } from "@/components/markdown";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
    ToolFetchLatestSpecificProductionReleaseUnitsPayload,
    ToolFetchSpecificProductionReleaseUnitsPayload,
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

function RawArgumentsMarkdownFallback({ payloadRaw }: { payloadRaw: unknown }) {
    const raw = readRawArgumentsFromPayloadRaw(payloadRaw);
    const md = rawArgumentsAsMarkdownFencedJson(raw);
    if (md == null) return null;
    return (
        <ArgField label="Raw arguments">
            <div className={cn("prose prose-sm dark:prose-invert max-w-none")}>
                <Markdown>{md}</Markdown>
            </div>
        </ArgField>
    );
}

function EmptyPlaceholder() {
    return <p className="text-muted-foreground text-sm">No arguments</p>;
}

function CopyableIdListField({
    label,
    ids,
    copyTitle,
}: {
    label: string;
    ids: string[];
    copyTitle: string;
}) {
    if (ids.length === 0) return null;
    return (
        <ArgField label={label}>
            <div className="flex min-w-0 flex-wrap content-start gap-x-2 gap-y-2">
                {ids.map((id) => (
                    <CopyableEntityIdBadge
                        key={id}
                        id={id}
                        truncate={false}
                        title={copyTitle}
                        className="min-w-0 shrink-0 justify-start self-start"
                    />
                ))}
            </div>
        </ArgField>
    );
}

export function nonEmptyStringList(values: string[] | undefined): string[] {
    return values?.filter((s) => s.trim() !== "") ?? [];
}

export function ToolFetchProductionReleaseUnitsArgChips({
    ids,
    copyTitle,
}: {
    ids: string[];
    copyTitle: string;
}) {
    if (ids.length === 0) return null;
    return (
        <div className="flex min-w-0 max-w-full flex-wrap content-start gap-x-2 gap-y-2 pr-3 pb-1">
            {ids.map((id) => (
                <CopyableEntityIdBadge
                    key={id}
                    id={id}
                    truncate={false}
                    title={copyTitle}
                    className="min-w-0 shrink-0 justify-start self-start"
                />
            ))}
        </div>
    );
}

export function ToolFetchLatestSpecificProductionReleaseUnitsArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolFetchLatestSpecificProductionReleaseUnitsPayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const unitPaths = nonEmptyStringList(args?.unit_paths);
    if (unitPaths.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <CopyableIdListField label="Unit paths" ids={unitPaths} copyTitle="Click to copy unit path" />
        </div>
    );
}

export function ToolFetchSpecificProductionReleaseUnitsArgsModalBody({
    args,
    payloadRaw,
}: {
    args: ToolFetchSpecificProductionReleaseUnitsPayload["args"] | null | undefined;
    payloadRaw: unknown;
}) {
    const unitIds = nonEmptyStringList(args?.unit_ids);
    if (unitIds.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <RawArgumentsMarkdownFallback payloadRaw={payloadRaw} />
                {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <CopyableIdListField label="Unit ids" ids={unitIds} copyTitle="Click to copy unit id" />
        </div>
    );
}
