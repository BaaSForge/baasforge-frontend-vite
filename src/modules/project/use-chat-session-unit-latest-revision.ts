"use client";

import { QueryKeys } from "@/constants/query-keys";
import {
    type ChatSessionUnitLatestRevisionsByUnitIdMap,
    stableUnitIdForRevisionCache,
} from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { useQuery } from "@tanstack/react-query";

/**
 * Subscribes to the map of unit id → latest revision for a single chat session (see `chatSessionUnitLatestRevisionsByUnitId` query key).
 */
function useChatSessionUnitLatestRevisionsByUnitIdMap(
    projectId: string | undefined,
    chatSessionId: string | undefined,
): ChatSessionUnitLatestRevisionsByUnitIdMap {
    const { data } = useQuery({
        queryKey: QueryKeys.chatSessionUnitLatestRevisionsByUnitId(projectId ?? "", chatSessionId ?? ""),
        queryFn: () => Promise.resolve({} as ChatSessionUnitLatestRevisionsByUnitIdMap),
        enabled: projectId != null && projectId !== "" && chatSessionId != null && chatSessionId !== "",
        staleTime: Infinity,
        gcTime: Infinity,
    });
    return data ?? {};
}

export function useChatSessionUnitLatestRevision(
    projectId: string | undefined,
    chatSessionId: string | undefined,
    unitId: string,
): number | undefined {
    const map = useChatSessionUnitLatestRevisionsByUnitIdMap(projectId, chatSessionId);
    return map[stableUnitIdForRevisionCache(unitId)];
}
