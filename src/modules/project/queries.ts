import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    getDraftUnits,
    getDraftUnitsAsOfReleaseControllerMessage,
    getProject,
    getProjectNonDraftUnits,
    getProjectRuntimes,
    getProjects,
    getReleases,
    getReleaseUnits,
} from "./api";
import { pickProductionRuntime } from "./runtime-release";

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

export function useProjectReleasesQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
    const enabledByOption = options?.enabled ?? true;
    return useQuery({
        queryKey: QueryKeys.projectReleases(projectId ?? ""),
        queryFn: () => getReleases(projectId!),
        enabled: !!projectId && enabledByOption,
    });
}

export function useProjectReleaseUnitsQuery(projectId: string | undefined, releaseRevision: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.projectReleaseUnits(projectId!, releaseRevision!),
        queryFn: () => getReleaseUnits(projectId!, releaseRevision!),
        enabled: !!projectId && !!releaseRevision,
    });
}

export function useProjectRuntimesQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
    const enabledByOption = options?.enabled ?? true;
    return useQuery({
        queryKey: QueryKeys.projectRuntimes(projectId ?? ""),
        queryFn: () => getProjectRuntimes(projectId!),
        enabled: !!projectId && enabledByOption,
    });
}

/** Same cache as {@link useProjectRuntimesQuery}; exposes the single production runtime row. */
export function useProductionRuntimeQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
    const runtimesQuery = useProjectRuntimesQuery(projectId, options);
    const productionRuntime = useMemo(() => pickProductionRuntime(runtimesQuery.data), [runtimesQuery.data]);
    return { ...runtimesQuery, data: productionRuntime };
}
