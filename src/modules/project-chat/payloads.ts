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
}

export interface ToolFetchLatestReleasesPayload {
    args: {
        limit?: number | null;
    };
    releases?: unknown[];
}

export interface ToolAnalyzeArchitecturePayload {
    args?: {
        intent?: string | null;
    };
    related_units?: unknown[];
    summary?: string;
    messages?: unknown[];
}

export interface FinishArchitectureAnalysisPayload {
    args?: {
        summary?: string | null;
        relevant_units_ids?: unknown[];
    };
    tool_name?: string;
}
