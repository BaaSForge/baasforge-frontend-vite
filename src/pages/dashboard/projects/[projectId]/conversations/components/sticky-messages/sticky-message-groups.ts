import { ChatMessageType, ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

/** Sticky “group” ids — one pinned row per group max; groups stack in this DOM order. */
export const STICKY_MESSAGE_GROUP_ORDER = ["user", "release_controller"] as const;

/** Vertical gap (px) between stacked sticky rows (UI + threshold math). */
export const STICKY_MESSAGE_GROUP_GAP_PX = 8;

/** Space below the page title before the first sticky row (whole stack inset). */
export const STICKY_MESSAGES_STACK_MARGIN_TOP_PX = 10;

export type StickyMessageGroupId = (typeof STICKY_MESSAGE_GROUP_ORDER)[number];

/** Horizontal gap between the user strip and the release square when both stickies share one row. */
export const STICKY_USER_RELEASE_COMBINED_GAP_PX = 6;

/** Measured row heights; `combined` is set when user + release share one bar. */
export type StickyRowHeights = Partial<Record<StickyMessageGroupId, number>> & {
    combined?: number;
};

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
