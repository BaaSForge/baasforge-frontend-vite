"use client";

import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType } from "@/modules/project/types";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
    flattenMessagesInRenderOrder,
    hasLiveProductionReleaseFromRcAfterMessageOnTimeline,
} from "./live-production-timeline-gate";

/** `undefined` = runtimes not loaded yet — caller should fall back to API/payload flags. */
export type LiveProductionTimelineAfterPredicate = (messageId: string) => boolean | undefined;

const LiveProductionTimelineContext = createContext<LiveProductionTimelineAfterPredicate | null>(null);

export function LiveProductionTimelineProvider({
    projectId,
    rootMessages,
    childrenByParentId,
    children,
}: {
    projectId: string | undefined;
    rootMessages: ChatMessageWithDeliveryStatus[];
    childrenByParentId: Map<string, ChatMessageWithDeliveryStatus[]>;
    children: ReactNode;
}) {
    const { data: runtimes, isSuccess } = useProjectRuntimesQuery(projectId);

    const orderedMessages = useMemo(
        () => flattenMessagesInRenderOrder(rootMessages, childrenByParentId),
        [rootMessages, childrenByParentId],
    );

    const liveProdReleaseIds = useMemo(() => {
        if (runtimes == null) return null;
        const ids = new Set<string>();
        for (const r of runtimes) {
            if (r.environment !== PlatformEnvironmentType.prod) continue;
            const id = r.live_release?.id;
            if (typeof id === "string" && id !== "") ids.add(id);
        }
        return ids;
    }, [runtimes]);

    const value = useMemo((): LiveProductionTimelineAfterPredicate => {
        return (messageId: string) => {
            if (!isSuccess || liveProdReleaseIds == null) return undefined;
            return hasLiveProductionReleaseFromRcAfterMessageOnTimeline(messageId, orderedMessages, liveProdReleaseIds);
        };
    }, [isSuccess, liveProdReleaseIds, orderedMessages]);

    return <LiveProductionTimelineContext.Provider value={value}>{children}</LiveProductionTimelineContext.Provider>;
}

export function useLiveProductionTimelineAfter(): LiveProductionTimelineAfterPredicate {
    return useContext(LiveProductionTimelineContext) ?? (() => undefined);
}
