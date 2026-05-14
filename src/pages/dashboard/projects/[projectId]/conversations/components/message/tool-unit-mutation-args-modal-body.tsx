import type { ReactNode } from "react";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Markdown } from "@/components/markdown";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UnitTypeBadge } from "@/modules/project/components/unit-type-badge";
import { STATIC_PROJECT_UNIT_TYPES, type ProjectUnitType } from "@/modules/project/types";
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

function rawArgumentsObject(payloadRaw: unknown): Record<string, unknown> | null {
    const raw = readRawArgumentsFromPayloadRaw(payloadRaw);
    if (raw != null && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
    return null;
}

function nonEmptyString(value: unknown): string | null {
    if (value == null) return null;
    const s = String(value).trim();
    return s.length > 0 ? s : null;
}

function parseProjectUnitType(value: unknown): ProjectUnitType | null {
    if (typeof value !== "string") return null;
    return (STATIC_PROJECT_UNIT_TYPES as readonly string[]).includes(value) ? (value as ProjectUnitType) : null;
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

function UnitIdArgValue({ unitId }: { unitId: string }) {
    return (
        <CopyableEntityIdBadge
            id={unitId}
            className="max-w-full self-start"
            truncate={false}
            title="Click to copy unit id"
        />
    );
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

function UnitTypeArgField({ unitTypeRaw }: { unitTypeRaw: string }) {
    const parsed = parseProjectUnitType(unitTypeRaw);
    return (
        <ArgField label="Unit type">
            {parsed != null ? (
                <UnitTypeBadge unitType={parsed} />
            ) : (
                <p className="text-foreground text-sm leading-relaxed">{unitTypeRaw}</p>
            )}
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
    const rawObj = rawArgumentsObject(payloadRaw);
    const hasUnitType = args?.unit_type != null && String(args.unit_type).trim() !== "";
    const hasCode = args?.code != null && String(args.code).trim() !== "";
    const hasExplanation = args?.explanation != null && String(args.explanation).trim() !== "";
    const structured = hasUnitType || hasCode || hasExplanation;

    if (!structured) {
        const unitTypeRaw = nonEmptyString(args?.unit_type) ?? nonEmptyString(rawObj?.unit_type);
        const rawHasKeysBeyondUnitType =
            rawObj != null &&
            Object.keys(rawObj).some((k) => {
                if (k === "unit_type") return false;
                const v = rawObj[k];
                if (v == null) return false;
                if (typeof v === "string") return v.trim() !== "";
                return true;
            });
        const rawPresent = readRawArgumentsFromPayloadRaw(payloadRaw) != null;
        const showRawBlock = rawHasKeysBeyondUnitType || (rawPresent && unitTypeRaw == null);

        return (
            <div className="flex flex-col gap-4">
                {unitTypeRaw != null ? <UnitTypeArgField unitTypeRaw={unitTypeRaw} /> : null}
                {showRawBlock ? <RawArgumentsFallback payloadRaw={payloadRaw} /> : null}
                {!rawPresent && unitTypeRaw == null ? <EmptyPlaceholder /> : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {hasUnitType ? <UnitTypeArgField unitTypeRaw={String(args!.unit_type)} /> : null}
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
    const rawObj = rawArgumentsObject(payloadRaw);
    const unitIdFromArgs = nonEmptyString(args?.unit_id);
    const unitId = unitIdFromArgs ?? nonEmptyString(rawObj?.unit_id);
    const rawHasKeysBeyondUnitId =
        rawObj != null &&
        Object.keys(rawObj).some((k) => {
            if (k === "unit_id") return false;
            const v = rawObj[k];
            if (v == null) return false;
            if (typeof v === "string") return v.trim() !== "";
            return true;
        });

    if (unitId != null) {
        return (
            <div className="flex flex-col gap-4">
                <ArgField label="Unit id">
                    <UnitIdArgValue unitId={unitId} />
                </ArgField>
                {unitIdFromArgs == null && rawHasKeysBeyondUnitId ? (
                    <RawArgumentsFallback payloadRaw={payloadRaw} />
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <RawArgumentsFallback payloadRaw={payloadRaw} />
            {!readRawArgumentsFromPayloadRaw(payloadRaw) && <EmptyPlaceholder />}
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
    const rawObj = rawArgumentsObject(payloadRaw);
    const unitIdFromArgs = nonEmptyString(args?.unit_id);
    const unitIdFromRaw = nonEmptyString(rawObj?.unit_id);
    const unitId = unitIdFromArgs ?? unitIdFromRaw;
    const hasUnitId = unitId != null;
    const hasRevision = args?.revision != null && String(args.revision).trim() !== "";
    const hasCode = args?.code != null && String(args.code).trim() !== "";
    const hasExplanation = args?.explanation != null && String(args.explanation).trim() !== "";
    const structured = hasUnitId || hasRevision || hasCode || hasExplanation;

    const rawHasKeysBeyondUnitId =
        rawObj != null &&
        Object.keys(rawObj).some((k) => {
            if (k === "unit_id") return false;
            const v = rawObj[k];
            if (v == null) return false;
            if (typeof v === "string") return v.trim() !== "";
            return true;
        });

    if (!structured) {
        if (unitId != null) {
            return (
                <div className="flex flex-col gap-4">
                    <ArgField label="Unit id">
                        <UnitIdArgValue unitId={unitId} />
                    </ArgField>
                    {unitIdFromArgs == null && rawHasKeysBeyondUnitId ? <RawArgumentsFallback payloadRaw={payloadRaw} /> : null}
                </div>
            );
        }
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
                    <UnitIdArgValue unitId={unitId} />
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
