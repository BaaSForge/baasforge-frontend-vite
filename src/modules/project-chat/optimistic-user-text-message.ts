import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatMessageType,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
} from "./types";

export function createOptimisticUserTextMessage(chatSessionId: string, text: string): ChatMessageWithDeliveryStatus {
    return {
        id: `temp-${Date.now()}`,
        chat_session_id: chatSessionId,
        role: ChatSessionRoleType.User,
        type: ChatMessageType.Text,
        payload: { text },
        created_at: new Date().toISOString(),
        delivery_status: ChatMessageDeliveryStatus.Pending,
        status: ChatMessageStatus.Completed,
        is_optimistic: true,
        is_first: false,
    };
}
