export interface ChatSessionResponse {
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    created_at: string;
    stage_project_runtime_id?: string | null;
}

export enum ChatSessionRoleType {
    User = "user",
    Ai = "ai",
}

export enum ChatMessageType {
    Text = "text",
    ToolFetchRelevantUnits = "tool_fetch_relevant_units",
    ToolFetchLatestReleases = "tool_fetch_latest_releases",
    ToolAnalyzeArchitecture = "tool_analyze_architecture",
    FinishArchitectureAnalysis = "tool_finish_architecture_analysis",
    ToolAnalyzeSolution = "tool_analyze_solution",
    FinishSolutionAnalysis = "tool_finish_solution_analysis",
    ToolImplementSolution = "tool_implement_solution",
    FinishImplementation = "tool_finish_implementation",
    ToolCreateUnit = "tool_create_unit",
    ToolModifyUnit = "tool_modify_unit",
    ToolRemoveUnit = "tool_remove_unit",
    Units = "units",
    Unit = "unit",
    Generating = "generating",
    GeneratingFailed = "generating_failed",
    GeneratingSucceed = "generating_succeed",
}

export enum ChatMessageStatus {
    Generating = "generating",
    Failed = "failed",
    Stopped = "stopped",
    Completed = "completed",
}

export type {
    TextMessagePayload,
    TextMessageRequestedToolCall,
    ThinkingBlock,
    ToolFetchLatestReleasesPayload,
    ToolFetchRelevantUnitsPayload,
    ToolAnalyzeArchitecturePayload,
    FinishArchitectureAnalysisPayload,
    ToolAnalyzeSolutionPayload,
    FinishSolutionAnalysisPayload,
    ToolImplementSolutionPayload,
    FinishImplementationPayload,
    ToolCreateUnitPayload,
    ToolModifyUnitPayload,
    ToolRemoveUnitPayload,
} from "./payloads";
export { getTextPayloadThinkingDisplay } from "./payloads";

export interface ChatMessageResponse {
    id: string;
    chat_session_id: string;
    role: ChatSessionRoleType;
    type: ChatMessageType;
    // TODO: make the payload strictly typed
    payload?: unknown | null;
    created_at: string;
    is_first: boolean;
    status: ChatMessageStatus;
    /** When set, this message is invoked by another message. */
    invoking_message_id?: string | null;
}

export interface CreateChatMessageApiResponse extends ChatMessageResponse {
    placeholder_message: ChatMessageResponse;
}

export interface ChatMessageDTO {
    type: ChatMessageType;
    payload?: unknown | null;
}

export enum ChatMessageDeliveryStatus {
    Pending = "pending",
    Failed = "failed",
    Delivered = "delivered",
}

export interface ChatMessageWithDeliveryStatus extends ChatMessageResponse {
    delivery_status: ChatMessageDeliveryStatus;
    is_optimistic?: boolean;
}

export type CreateProjectChatSessionMessageMutationParams = {
    projectId: string;
    chatSessionId: string;
    optimisticMessage: ChatMessageWithDeliveryStatus;
};
