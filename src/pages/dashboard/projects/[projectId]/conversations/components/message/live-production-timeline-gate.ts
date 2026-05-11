import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { getReleaseControllerPayload } from "./release-controller-box-shared";

/** Same DFS pre-order as {@link MessageBranch}: parent, then children (by `created_at`). */
export function flattenMessagesInRenderOrder(
    roots: ChatMessageWithDeliveryStatus[],
    childrenByParentId: Map<string, ChatMessageWithDeliveryStatus[]>,
): ChatMessageWithDeliveryStatus[] {
    const out: ChatMessageWithDeliveryStatus[] = [];
    const visit = (m: ChatMessageWithDeliveryStatus) => {
        out.push(m);
        const kids = childrenByParentId.get(m.id) ?? [];
        for (const c of kids) visit(c);
    };
    for (const r of roots) visit(r);
    return out;
}

/**
 * True when some release-controller message **after** `messageId` on the rendered timeline has a
 * `prod_release` whose id is in `liveProdReleaseIds` (i.e. that revision is currently live on a prod runtime).
 */
export function hasLiveProductionReleaseFromRcAfterMessageOnTimeline(
    messageId: string,
    orderedMessages: readonly ChatMessageWithDeliveryStatus[],
    liveProdReleaseIds: ReadonlySet<string>,
): boolean {
    const idx = orderedMessages.findIndex((m) => m.id === messageId);
    if (idx < 0) return false;
    for (let i = idx + 1; i < orderedMessages.length; i++) {
        const m = orderedMessages[i];
        if (m.type !== ChatMessageType.ReleaseControllerBox) continue;
        const prId = getReleaseControllerPayload(m).prod_release?.id;
        if (prId != null && liveProdReleaseIds.has(prId)) return true;
    }
    return false;
}
