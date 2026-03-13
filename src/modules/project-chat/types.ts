export interface ChatSessionResponse {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  created_at: string;
  stage_project_runtime_id?: number | null;
}

export enum ChatSessionRoleType {
  User = "user",
  Ai = "ai",
}

export enum ChatMessageType {
  Text = "text",
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

export interface ChatMessageResponse {
  id: number;
  chat_session_id: number;
  role: ChatSessionRoleType;
  type: ChatMessageType;
  payload?: unknown | null;
  created_at: string;
  is_first: boolean;
  status: ChatMessageStatus;
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
  projectId: number;
  chatSessionId: number;
  optimisticMessage: ChatMessageWithDeliveryStatus;
}