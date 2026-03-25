import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

function sortByCreatedAt(a: ChatMessageWithDeliveryStatus, b: ChatMessageWithDeliveryStatus): number {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

export function partitionMessagesByInvokingParent(messages: ChatMessageWithDeliveryStatus[]): {
    rootMessages: ChatMessageWithDeliveryStatus[];
    childrenByParentId: Map<string, ChatMessageWithDeliveryStatus[]>;
} {
    const ids = new Set(messages.map((m) => m.id));
    const childrenByParentId = new Map<string, ChatMessageWithDeliveryStatus[]>();

    for (const m of messages) {
        const pid = m.invoking_message_id;
        if (!pid || !ids.has(pid)) continue;
        const list = childrenByParentId.get(pid);
        if (list) list.push(m);
        else childrenByParentId.set(pid, [m]);
    }

    for (const [, list] of childrenByParentId) {
        list.sort(sortByCreatedAt);
    }

    const rootMessages = messages
        .filter((m) => {
            const pid = m.invoking_message_id;
            return !pid || !ids.has(pid);
        })
        .sort(sortByCreatedAt);

    return { rootMessages, childrenByParentId };
}
