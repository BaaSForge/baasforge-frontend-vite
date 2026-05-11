"use client";

import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType } from "@/modules/project/types";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useConversationSessionMessages } from "../conversation-session-messages-context";
import {
    isRejectDisabledDueToImmediatePriorLiveProdRelease,
    isUserEditDisabledDueToSubsequentLiveProdReleaseOnTimeline,
} from "./live-production-timeline-gate";

/** `undefined` = runtimes not loaded yet — caller should fall back to API/payload flags. */
export type LiveProductionTimelinePredicate = (messageId: string) => boolean | undefined;

export type LiveProductionSessionGates = {
    /** Reject controller only — see `isRejectDisabledDueToImmediatePriorLiveProdRelease`. */
    rejectImmediatePriorLiveProd: LiveProductionTimelinePredicate;
    /** User text edit only — any live prod release controller strictly after this user message. */
    userEditSubsequentLiveProd: LiveProductionTimelinePredicate;
};

const LiveProductionTimelineContext = createContext<LiveProductionSessionGates | null>(null);

export function LiveProductionTimelineProvider({
    projectId,
    children,
}: {
    projectId: string | undefined;
    children: ReactNode;
}) {
    const sessionMessages = useConversationSessionMessages();
    const { data: runtimes, isSuccess } = useProjectRuntimesQuery(projectId);

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

    const value = useMemo((): LiveProductionSessionGates => {
        if (!isSuccess || liveProdReleaseIds == null) {
            return {
                rejectImmediatePriorLiveProd: () => undefined,
                userEditSubsequentLiveProd: () => undefined,
            };
        }
        return {
            rejectImmediatePriorLiveProd: (messageId: string) =>
                isRejectDisabledDueToImmediatePriorLiveProdRelease(messageId, sessionMessages, liveProdReleaseIds),
            userEditSubsequentLiveProd: (messageId: string) =>
                isUserEditDisabledDueToSubsequentLiveProdReleaseOnTimeline(
                    messageId,
                    sessionMessages,
                    liveProdReleaseIds,
                ),
        };
    }, [isSuccess, liveProdReleaseIds, sessionMessages]);

    return <LiveProductionTimelineContext.Provider value={value}>{children}</LiveProductionTimelineContext.Provider>;
}

export function useLiveProductionSessionGates(): LiveProductionSessionGates {
    return (
        useContext(LiveProductionTimelineContext) ?? {
            rejectImmediatePriorLiveProd: () => undefined,
            userEditSubsequentLiveProd: () => undefined,
        }
    );
}
