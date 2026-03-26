import type { ProjectUnitResponse } from "@/modules/project/types";

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
}

/** Non-empty `error` from any tool message payload (optional on all tool payloads). */
export function getToolPayloadErrorString(payload: unknown): string | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    const e = (payload as { error?: unknown }).error;
    if (typeof e !== "string" || e.trim() === "") return null;
    return e;
}
