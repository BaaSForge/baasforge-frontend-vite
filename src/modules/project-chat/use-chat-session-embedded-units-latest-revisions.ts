import { QueryKeys } from "@/constants/query-keys";
import type { ProjectUnitResponse } from "@/modules/project/types";
import {
    mergeChatSessionUnitLatestRevisionsFromRevisionList,
    stableUnitIdForRevisionCache,
} from "@/modules/project/chat-session-unit-latest-revisions-cache";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { postChatSessionUnitLatestRevisionsByIds } from "./api";

/**
 * Fetches latest revision numbers for units embedded in chat (tool payloads) and merges them into
 * `chatSessionUnitLatestRevisionsByUnitId` (badges read from that cache). Returns the same `initialUnits`;
 * `isRefreshing` reflects the `unit-latest-revisions-by-ids` request.
 */
export function useChatSessionEmbeddedUnitsLatestRevisions(
    projectId: string | undefined,
    chatSessionId: string | undefined,
    initialUnits: ProjectUnitResponse[],
    enabled: boolean,
): { units: ProjectUnitResponse[]; isRefreshing: boolean } {
    const unitPathsForRequest = useMemo(
        () => initialUnits.map((u) => stableUnitIdForRevisionCache(u.id)),
        [initialUnits],
    );
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: QueryKeys.chatSessionUnitLatestRevisionsByIds(projectId ?? "", chatSessionId ?? "", unitPathsForRequest),
        queryFn: () => postChatSessionUnitLatestRevisionsByIds(projectId!, chatSessionId!, unitPathsForRequest),
        enabled: enabled && unitPathsForRequest.length > 0 && projectId != null && chatSessionId != null,
    });

    useEffect(() => {
        const data = query.data;
        if (projectId == null || chatSessionId == null || data == null) return;
        const revisions = data.revisions;
        if (!Array.isArray(revisions) || revisions.length === 0) return;
        mergeChatSessionUnitLatestRevisionsFromRevisionList(
            queryClient,
            projectId,
            chatSessionId,
            unitPathsForRequest,
            revisions,
        );
    }, [projectId, chatSessionId, query.data, queryClient, unitPathsForRequest]);

    const isRefreshing = enabled && unitPathsForRequest.length > 0 && query.isFetching;

    return { units: initialUnits, isRefreshing };
}
