import { ChatMessageType, ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

/** Sticky “group” ids — one pinned row per group max; groups stack in this DOM order. */
export const STICKY_MESSAGE_GROUP_ORDER = ["user", "release_controller"] as const;

/** Vertical gap (px) between stacked sticky rows (UI + threshold math). */
export const STICKY_MESSAGE_GROUP_GAP_PX = 8;

/** Space below the page title before the first sticky row (whole stack inset). */
export const STICKY_MESSAGES_STACK_MARGIN_TOP_PX = 10;

export type StickyMessageGroupId = (typeof STICKY_MESSAGE_GROUP_ORDER)[number];

export function getStickyMessageGroupForMessage(
    message: ChatMessageWithDeliveryStatus,
    options?: { hideReleaseControllerSticky?: boolean },
): StickyMessageGroupId | null {
    if (message.type === ChatMessageType.Text && message.role === ChatSessionRoleType.User) {
        return "user";
    }
    if (message.type === ChatMessageType.ReleaseControllerBox) {
        if (options?.hideReleaseControllerSticky) return null;
        return "release_controller";
    }
    return null;
}
