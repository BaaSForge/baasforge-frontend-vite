export interface TextMessageRequestedToolCall {
    tool_call_id?: string;
    tool_name: string;
    tool_arguments_to_pass: Record<string, unknown>;
}

export interface TextMessagePayload {
    text: string;
    requested_tool_calls?: TextMessageRequestedToolCall[];
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
