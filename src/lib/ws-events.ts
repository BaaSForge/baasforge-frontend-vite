export type ChatSessionNewMessageChunkEvent = {
  type: "chat_session_new_message_chunk";
  topic: string;
  message_id: number;
  chunk_index: number;
  content: string;
  done: boolean;
};

export type ProjectDeletedEvent = {
  type: "project_deleted";
  projectId: string;
};

export type RuntimeCreatedEvent = {
  type: "runtime_created";
  projectId: string;
  runtimeId: string;
};

export type WsServerEvent =
  | ChatSessionNewMessageChunkEvent
  | ProjectDeletedEvent
  | RuntimeCreatedEvent
  | { type: "subscribed"; topic: string }
  | { type: "unsubscribed"; topic: string }
  | { type: "error"; message: string };

export function isWsServerEvent(data: unknown): data is WsServerEvent {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as { type?: unknown }).type === "string"
  );
}

export function isProjectDeletedEvent(data: unknown): data is ProjectDeletedEvent {
  return isWsServerEvent(data) && data.type === "project_deleted";
}

export function isRuntimeCreatedEvent(data: unknown): data is RuntimeCreatedEvent {
  return isWsServerEvent(data) && data.type === "runtime_created";
}

export function isChatSessionNewMessageChunkEvent(data: unknown): data is ChatSessionNewMessageChunkEvent {
  return isWsServerEvent(data) && data.type === "chat_session_new_message_chunk";
}

export function userTopic(userId: number): string {
  return `user:${userId}`;
}
