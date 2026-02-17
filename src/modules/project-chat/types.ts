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

export interface ChatMessageResponse {
  id: number;
  chat_session_id: number;
  role: ChatSessionRoleType;
  type: ChatMessageType;
  payload?: any | null;
  created_at: string;
}

export interface ChatMessageDTO {
  type: ChatMessageType;
  payload?: any | null;
}

export enum ChatMessageDeliveryStatus {
  Pending = "pending",
  Failed = "failed",
  Delivered = "delivered",
}

export interface ChatMessageWithDeliveryStatus extends ChatMessageResponse {
  delivery_status: ChatMessageDeliveryStatus;
}

export type CreateProjectChatSessionMessageMutationParams = {
  projectId: number;
  chatSessionId: number;
  optimisticMessage: ChatMessageWithDeliveryStatus;
}