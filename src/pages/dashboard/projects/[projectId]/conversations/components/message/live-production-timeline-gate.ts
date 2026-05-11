import {
    ChatMessageType,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";
import { getReleaseControllerPayload } from "./release-controller-box-shared";

/**
 * User message edit: true if any release-controller message **after** this user message in session order
 * carries a prod release that is live on a runtime (same turn or a later turn).
 */
export function isUserEditDisabledDueToSubsequentLiveProdReleaseOnTimeline(
    messageId: string,
    sessionMessagesChronological: readonly ChatMessageWithDeliveryStatus[],
    liveProdReleaseIds: ReadonlySet<string>,
): boolean | undefined {
    const idx = sessionMessagesChronological.findIndex((m) => m.id === messageId);
    if (idx < 0) return undefined;
    if (sessionMessagesChronological[idx].role !== ChatSessionRoleType.User) return undefined;

    for (let j = idx + 1; j < sessionMessagesChronological.length; j++) {
        const m = sessionMessagesChronological[j];
        if (m.type !== ChatMessageType.ReleaseControllerBox) continue;
        const prId = getReleaseControllerPayload(m).prod_release?.id;
        if (prId != null && liveProdReleaseIds.has(prId)) return true;
    }
    return false;
}

/** Index of the last user message strictly before `index`, or -1 if none. */
function lastUserMessageIndexBefore(messages: readonly ChatMessageWithDeliveryStatus[], index: number): number {
    for (let j = index - 1; j >= 0; j--) {
        if (messages[j].role === ChatSessionRoleType.User) return j;
    }
    return -1;
}

/**
 * True when the reject controller’s immediate predecessor in session order is a release controller
 * whose prod revision is live on a runtime, and that predecessor is part of the same assistant turn
 * (strictly after the last user message before this reject).
 */
export function isRejectDisabledDueToImmediatePriorLiveProdRelease(
    messageId: string,
    sessionMessagesChronological: readonly ChatMessageWithDeliveryStatus[],
    liveProdReleaseIds: ReadonlySet<string>,
): boolean {
    const idx = sessionMessagesChronological.findIndex((m) => m.id === messageId);
    if (idx <= 0) return false;
    const lastUserIdx = lastUserMessageIndexBefore(sessionMessagesChronological, idx);
    const prevIdx = idx - 1;
    if (prevIdx <= lastUserIdx) return false;
    const prev = sessionMessagesChronological[prevIdx];
    if (prev.type !== ChatMessageType.ReleaseControllerBox) return false;
    const prId = getReleaseControllerPayload(prev).prod_release?.id;
    return prId != null && liveProdReleaseIds.has(prId);
}
