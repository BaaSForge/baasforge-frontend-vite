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
