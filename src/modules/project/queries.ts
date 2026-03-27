import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import {
    getDraftUnits,
    getDraftUnitsAsOfReleaseControllerMessage,
    getProject,
    getProjectNonDraftUnits,
    getProjects,
    getReleases,
    getReleaseUnits,
    getRuntimesWithConnectedChat,
} from "./api";

export function useProjectsQuery() {
    return useQuery({
        queryKey: QueryKeys.PROJECTS_LIST,
        queryFn: getProjects,
    });
}

export function useProjectQuery(projectId: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectDetail(projectId ?? ""),
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });
}

export function useProjectNonDraftUnitsQuery(projectId: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectNonDraftUnits(projectId ?? ""),
        queryFn: () => getProjectNonDraftUnits(projectId!),
        enabled: !!projectId,
    });
}

export function useProjectDraftUnitsQuery(projectId: string | undefined, chatSessionId: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectDraftUnits(projectId ?? "", chatSessionId ?? ""),
        queryFn: () => getDraftUnits(projectId!, chatSessionId!),
        enabled: !!projectId && !!chatSessionId,
    });
}

export function useProjectDraftUnitsAsOfReleaseControllerMessageQuery(
    projectId: string | undefined,
    chatSessionId: string | undefined,
    releaseControllerMessageId: string | undefined,
) {
    return useQuery({
        queryKey: QueryKeys.projectDraftUnitsAsOfReleaseControllerMessage(
            projectId ?? "",
            chatSessionId ?? "",
            releaseControllerMessageId ?? "",
        ),
        queryFn: () => getDraftUnitsAsOfReleaseControllerMessage(projectId!, chatSessionId!, releaseControllerMessageId!),
        enabled: !!projectId && !!chatSessionId && !!releaseControllerMessageId,
    });
}

export function useProjectReleasesQuery(projectId: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectReleases(projectId ?? ""),
        queryFn: () => getReleases(projectId!),
        enabled: !!projectId,
    });
}

export function useProjectReleaseUnitsQuery(projectId: string | undefined, releaseVersion: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectReleaseUnits(projectId!, releaseVersion!),
        queryFn: () => getReleaseUnits(projectId!, releaseVersion!),
        enabled: !!projectId && !!releaseVersion,
    });
}

export function useProjectRuntimesWithConnectedChatQuery(projectId: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectRuntimesWithConnectedChat(projectId ?? ""),
        queryFn: () => getRuntimesWithConnectedChat(projectId!),
        enabled: !!projectId,
    });
}
