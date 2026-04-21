import { QueryKeys } from "@/constants/query-keys";
import type { QueryClient } from "@tanstack/react-query";
import { PlatformEnvironmentType } from "./types";

export async function invalidateQueriesAfterRejectControllerBox(queryClient: QueryClient, projectId: string) {
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });
    await queryClient.invalidateQueries({
        queryKey: QueryKeys.projectReleases(projectId, PlatformEnvironmentType.stage),
    });
}

export async function invalidateQueriesAfterRuntimeDeploy(
    queryClient: QueryClient,
    projectId: string,
    env: PlatformEnvironmentType,
) {
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });
    await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleases(projectId, env) });
    if (env === PlatformEnvironmentType.prod) {
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectAllChatSessionDetailByProject(projectId) });
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDraftUnitsByProject(projectId) });
        await queryClient.invalidateQueries({
            queryKey: QueryKeys.projectDraftUnitsAsOfReleaseControllerMessageByProject(projectId),
        });
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleaseUnitsByProject(projectId) });
        await queryClient.invalidateQueries({ queryKey: QueryKeys.projectReleaseUnitsAllByProject(projectId) });
    }
}
