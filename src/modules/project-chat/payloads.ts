import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";

export interface TextMessageRequestedToolCall {
    tool_call_id?: string;
    tool_name: string;
    tool_arguments_to_pass: Record<string, unknown>;
}

/** One extended-thinking segment (e.g. Claude extended thinking). */
export interface ThinkingBlock {
    thinking: string;
    /** Opaque; for API replay only — not shown in UI. */
    signature?: string;
}

export interface TextMessagePayload {
    text: string;
    requested_tool_calls?: TextMessageRequestedToolCall[];
    /** Reasoning / extended thinking segments. */
    thinking_blocks?: ThinkingBlock[];
}

/** Concatenated visible thinking for display (matches server `thinking_display`). */
export function getTextPayloadThinkingDisplay(payload: unknown): string | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    const blocks = (payload as TextMessagePayload).thinking_blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) return null;
    let out = "";
    for (const b of blocks) {
        if (b != null && typeof b === "object" && typeof b.thinking === "string") {
            out += b.thinking;
        }
    }
    return out.length > 0 ? out : null;
}

export interface ToolFetchRelevantUnitsPayload {
    args: {
        query?: string | null;
    };
    units?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolFetchLatestReleasesPayload {
    args: {
        limit?: number | null;
    };
    releases?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolFetchReleaseTracesPayload {
    args?: {
        trace_id?: string | null;
        release_id?: string | null;
    };
    spans?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolListUnitContextsPayload {
    context_slugs?: string[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ContextModulesEntry {
    context_slug: string;
    module_slugs: string[];
}

export interface ToolListModulesForUnitContextsPayload {
    args?: {
        context_slugs?: string[];
    };
    by_context?: ContextModulesEntry[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolAnalyzeArchitecturePayload {
    args?: {
        intent?: string | null;
    };
    related_units?: unknown[];
    detailed_report?: string;
    messages?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface FinishArchitectureAnalysisPayload {
    args?: {
        detailed_report?: string | null;
        relevant_units_ids?: unknown[];
    };
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolAnalyzeObservabilityPayload {
    args?: {
        brief?: string | null;
        trace_id?: string | null;
        release_id?: string | null;
    };
    related_units?: unknown[];
    detailed_report?: string;
    messages?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface FinishObservabilityAnalysisPayload {
    args?: {
        detailed_report?: string | null;
        relevant_unit_ids?: unknown[];
    };
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export function relevantUnitIdStringsFromToolArgs(args: { relevant_unit_ids?: unknown } | null | undefined): string[] {
    if (args == null) return [];
    const raw = args.relevant_unit_ids;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
}

export function orderedDraftUnitsForFullIds(ids: string[], draftUnits: ProjectUnitResponse[] | undefined): ProjectUnitResponse[] {
    if (ids.length === 0 || draftUnits == null || draftUnits.length === 0) return [];
    const byId = new Map(draftUnits.map((u) => [u.id, u]));
    const out: ProjectUnitResponse[] = [];
    for (const id of ids) {
        const u = byId.get(id);
        if (u != null) out.push(u);
    }
    return out;
}

export interface ToolAnalyzeSolutionPayload {
    args?: {
        intent?: string | null;
    };
    detailed_report?: string;
    messages?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface FinishSolutionAnalysisPayload {
    args?: {
        detailed_report?: string | null;
    };
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface ToolImplementSolutionPayload {
    args?: {
        directive?: string | null;
    };
    detailed_report?: string;
    messages?: unknown[];
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export interface FinishImplementationPayload {
    args?: {
        detailed_report?: string | null;
    };
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
}

export type UnitSubTaskStatus = "succeeded" | "failed" | "waiting";

export interface ToolCreateUnitPayload {
    args?: {
        code?: ProjectUnitResponse["code"];
        explanation?: ProjectUnitResponse["explanation"];
        unit_type?: ProjectUnitResponse["unit_type"] | null;
    };
    created_unit?: ProjectUnitResponse;
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
    pre_check_sub_task?: UnitSubTaskStatus;
    compiler_check_sub_task?: UnitSubTaskStatus;
    rule_check_sub_task?: UnitSubTaskStatus;
}

export interface ToolModifyUnitPayload {
    args?: {
        code?: ProjectUnitResponse["code"];
        explanation?: ProjectUnitResponse["explanation"];
        unit_id?: ProjectUnitResponse["id"] | null;
        revision?: ProjectUnitResponse["revision"] | null;
    };
    revised_unit?: ProjectUnitResponse;
    tool_call_id?: string;
    tool_name?: string;
    error?: string;
    pre_check_sub_task?: UnitSubTaskStatus;
    compiler_check_sub_task?: UnitSubTaskStatus;
    rule_check_sub_task?: UnitSubTaskStatus;
}

export interface ToolRemoveUnitArgs {
    unit_id?: ProjectUnitResponse["id"] | null;
}

export interface ToolRemoveUnitPayload {
    args?: ToolRemoveUnitArgs;
    removed_unit?: ProjectUnitResponse;
    error?: string;
    tool_call_id?: string;
    tool_name?: string;
    pre_check_sub_task?: UnitSubTaskStatus;
    rule_check_sub_task?: UnitSubTaskStatus;
}

export interface ReleaseControllerBoxPayload {
    stage_release?: ReleaseResponse | null;
    prod_release?: ReleaseResponse | null;
    is_disabled_due_to_reject?: boolean;
}

export interface RejectControllerBoxPayload {
    is_rejected?: boolean;
    is_disabled_due_to_production_release?: boolean;
    unit_changes?: ProjectUnitResponse[];
}

/**
 * Backend shape when `payload` is null or incomplete (e.g. tool validation failed before a full payload was built).
 * Matches API fields such as `error`, `raw_arguments`, `tool_call_id`, and `tool_name`.
 */
export interface ToolMessagePayloadRaw {
    error?: string;
    raw_arguments?: Record<string, unknown> | unknown;
}

function readToolPayloadErrorFromObject(obj: unknown): string | null {
    if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return null;
    const e = (obj as { error?: unknown }).error;
    if (typeof e !== "string" || e.trim() === "") return null;
    return e;
}

/**
 * Non-empty `error` from the tool message `payload`, else from `payload_raw` (same shape as payload error).
 */
export function getToolPayloadErrorString(payload: unknown, payloadRaw?: unknown): string | null {
    const fromPayload = readToolPayloadErrorFromObject(payload);
    if (fromPayload != null) return fromPayload;
    return readToolPayloadErrorFromObject(payloadRaw);
}

const RAW_ARGUMENTS_TOOLTIP_TITLE = "Raw Arguments";

function hasMeaningfulFormattedToolArgs(formattedArgs: string): boolean {
    const t = formattedArgs.trim();
    return t !== "" && t !== "—";
}

function readRawArgumentsFromPayloadRaw(payloadRaw: unknown): unknown | undefined {
    if (payloadRaw == null || typeof payloadRaw !== "object" || Array.isArray(payloadRaw)) return undefined;
    if (!Object.prototype.hasOwnProperty.call(payloadRaw, "raw_arguments")) return undefined;
    return (payloadRaw as ToolMessagePayloadRaw).raw_arguments;
}

/** Default max length for each `key: value` line’s value segment (tooltip). */
const RAW_ARGS_DEFAULT_MAX_VALUE_CHARS = 140;
/** Default max length for the full formatted block (tooltip). */
const RAW_ARGS_DEFAULT_MAX_TOTAL_CHARS = 900;

function truncateWithEllipsis(s: string, maxLen: number): string {
    if (maxLen <= 0) return "";
    if (s.length <= maxLen) return s;
    const cut = maxLen - 1;
    return cut <= 0 ? "…" : `${s.slice(0, cut)}…`;
}

function formatRawArgumentValueForLine(v: unknown, maxValueChars: number): string {
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "string") {
        const t = v.trim();
        return truncateWithEllipsis(t.length > 0 ? t : "(empty)", maxValueChars);
    }
    if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v);
    try {
        return truncateWithEllipsis(JSON.stringify(v), maxValueChars);
    } catch {
        return truncateWithEllipsis(String(v), maxValueChars);
    }
}

/**
 * Human-readable lines (`key: value`) for tooltip display, with per-value and total caps.
 * Plain objects use sorted keys; arrays list indexed lines; scalars stringify simply.
 */
export function formatPayloadRawArgumentsForDisplay(
    value: unknown,
    options?: { maxValueChars?: number; maxTotalChars?: number },
): string {
    const maxValue = options?.maxValueChars ?? RAW_ARGS_DEFAULT_MAX_VALUE_CHARS;
    const maxTotal = options?.maxTotalChars ?? RAW_ARGS_DEFAULT_MAX_TOTAL_CHARS;

    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return truncateWithEllipsis(value, maxTotal);
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return truncateWithEllipsis(String(value), maxTotal);
    }

    let lines: string[];
    if (Array.isArray(value)) {
        lines = value.map((item, i) => `[${i}]: ${formatRawArgumentValueForLine(item, maxValue)}`);
    } else if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
        lines = entries.map(([k, v]) => `${k}: ${formatRawArgumentValueForLine(v, maxValue)}`);
    } else {
        return truncateWithEllipsis(String(value), maxTotal);
    }

    const out = lines.length > 0 ? lines.join("\n") : "—";
    return truncateWithEllipsis(out, maxTotal);
}

export type ToolArgumentsTooltipParts = {
    /** Sub-heading under the tooltip trigger title; null when {@link options.omitParsedArgumentsHeading} hides it for parsed args. */
    heading: string | null;
    body: string;
};

type ToolArgumentsTooltipOptions = {
    /** When true, omit the "Arguments" sub-heading if parsed args are non-empty (e.g. finish-tool tooltips). */
    omitParsedArgumentsHeading?: boolean;
};

/** Tooltip sub-heading + body: parsed Arguments, else Raw Arguments from `payload_raw`, else em dash. */
export function getToolArgumentsTooltipHeadingAndBody(
    formattedArgs: string,
    payloadRaw: unknown | null | undefined,
    options?: ToolArgumentsTooltipOptions,
): ToolArgumentsTooltipParts {
    const omitParsed = options?.omitParsedArgumentsHeading === true;
    if (hasMeaningfulFormattedToolArgs(formattedArgs)) {
        return {
            heading: omitParsed ? null : "Arguments",
            body: formattedArgs,
        };
    }
    const rawOnly = readRawArgumentsFromPayloadRaw(payloadRaw);
    if (rawOnly !== undefined) {
        return {
            heading: RAW_ARGUMENTS_TOOLTIP_TITLE,
            body: formatPayloadRawArgumentsForDisplay(rawOnly),
        };
    }
    return {
        heading: omitParsed ? null : "Arguments",
        body: "—",
    };
}
