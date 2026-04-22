import { QueryKeys } from "@/constants/query-keys";
import type { QueryClient } from "@tanstack/react-query";
import { PlatformEnvironmentType } from "./types";

export async function invalidateLastNotDisabledReleaseControllerMessageQueries(
    queryClient: QueryClient,
    projectId: string,
) {
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectLastNotDisabledReleaseControllerMessageByProject(projectId),
    });
}

// NOTE: When user rejects or edit a message (which cause a truncate), some stage releases might be deleted so some runtimes might be disconnected
// Also some units might be removed in truncate
export async function invalidateDueToRejectOrEdit(queryClient: QueryClient, projectId: string) {
    // Some stage releases might be removed, so update the chat session list as it shows stage releases as badges for each session
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });

    // Some runtimes might be disconnected from stage releases, so update the runtimes list
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });

    // Some stage releases might be removed, so update the releases list
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectReleases(projectId, PlatformEnvironmentType.stage),
    });

    // Some units might be removed in truncate, so update the draft units list
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDraftUnitsByProject(projectId) });

    // Some units might be removed in truncate, so update the draft units for the release controller
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDraftUnitsAsOfReleaseControllerMessageByProject(projectId),
    });

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
