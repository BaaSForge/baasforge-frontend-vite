import { QueryKeys } from "@/constants/query-keys";
import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { PlatformEnvironmentType } from "./types";

export async function invalidateLastNotDisabledReleaseControllerMessageQueries(
    queryClient: QueryClient,
    projectId: string,
) {
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectLastNotDisabledReleaseControllerMessageByProject(projectId),
    });
}

/** Drops draft-units-as-of-release-controller rows so broad invalidation does not refetch deleted messages. */
export function removeProjectDraftUnitsAsOfReleaseControllerQueries(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
    releaseControllerMessageIds: readonly string[],
) {
    for (const messageId of releaseControllerMessageIds) {
        const queryKey = QueryKeys.projectDraftUnitsAsOfReleaseControllerMessage(projectId, chatSessionId, messageId);
        void queryClient.cancelQueries({ queryKey });
        queryClient.removeQueries({ queryKey });
    }
}

function releaseControllerMessageIdsInSession(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
): string[] {
    const data = queryClient.getQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(
        QueryKeys.projectChatSessionMessages(projectId, chatSessionId),
    );
    if (data == null) return [];
    return data.pages
        .flatMap((page) => page)
        .filter((m) => m.type === ChatMessageType.ReleaseControllerBox)
        .map((m) => m.id);
}

/** Refreshes draft-units-as-of only for release controllers still in the session cache (avoids 404s on truncated rows). */
export async function invalidateProjectDraftUnitsAsOfRemainingReleaseControllers(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
): Promise<void> {
    const messageIds = releaseControllerMessageIdsInSession(queryClient, projectId, chatSessionId);
    await Promise.all(
        messageIds.map((messageId) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.projectDraftUnitsAsOfReleaseControllerMessage(projectId, chatSessionId, messageId),
            }),
        ),
    );
}

// NOTE: When user rejects or edit a message (which cause a truncate), some stage releases might be deleted so some runtimes might be disconnected
// Also some units might be removed in truncate
export async function invalidateDueToRejectOrEdit(
    queryClient: QueryClient,
    projectId: string,
    chatSessionId: string,
) {
    // Some stage releases might be removed, so update the chat session list as it shows stage releases as badges for each session
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });

    // Some runtimes might be disconnected from stage releases, so update the runtimes list
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });

    // Some stage releases might be removed, so update the releases list
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectReleases(projectId, PlatformEnvironmentType.stage),
    });

    // Stage release set may have changed, so the by-revision lookup cache (e.g. Start Debug modal) must be refreshed
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectLiveReleaseByRevisionByEnv(projectId, PlatformEnvironmentType.stage),
    });

    // Some units might be removed in truncate, so update the draft units list
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDraftUnitsByProject(projectId) });

    await invalidateProjectDraftUnitsAsOfRemainingReleaseControllers(queryClient, projectId, chatSessionId);

    // Last-not-disabled release controller message may change (sidebar footer + thread)
    await invalidateLastNotDisabledReleaseControllerMessageQueries(queryClient, projectId);
}

export async function invalidateQueriesAfterRuntimeDeploy(
    queryClient: QueryClient,
    projectId: string,
    env: PlatformEnvironmentType,
) {
    // Chat session list shows releases as badge for each session, so we need to update it
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
    // The runtime as connected to the releases, so we need to update it
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });
    // New releases, so just update it
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleases(projectId, env) });

    // A new release shifts which revision is "live", so refresh by-revision lookups (e.g. Start Debug modal) for this env
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectLiveReleaseByRevisionByEnv(projectId, env),
    });

    // The last release controller may have a new release after deploy (secondary sidebar footer reads this query)
    await invalidateLastNotDisabledReleaseControllerMessageQueries(queryClient, projectId);

    if (env === PlatformEnvironmentType.prod) {
        // To update the chat sessions details as they might be `stale base` now
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectAllChatSessionDetailByProject(projectId) });

        // Draft units have a `live` badge, for production release we must update it
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDraftUnitsByProject(projectId) });

        // The draft units for the release controller has a `live` badge, so we must update it
        await queryClient.invalidateQueries({
            queryKey: QueryKeys.projectDraftUnitsAsOfReleaseControllerMessageByProject(projectId),
        });

        // The new units tab in the `units & releases` page have a `live` badge, so we must update it
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleaseUnitsByProject(projectId) });

        // The all units tab in the `units & releases` page have a `live` badge, so we must update it
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleaseUnitsAllByProject(projectId) });
    }
}
