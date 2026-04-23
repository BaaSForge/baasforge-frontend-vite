import { QueryKeys } from "@/constants/query-keys";
import { ChatMessageDeliveryStatus } from "@/modules/project-chat/types";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    getDraftUnits,
    getDraftUnitsAsOfReleaseControllerMessage,
    getLastNotDisabledReleaseControllerMessage,
    getProject,
    getProjectNonDraftUnits,
    getProjectRuntimes,
    getProjects,
    getReleases,
    getReleaseContexts,
    getReleaseUnits,
    postListReleaseUnitsAll,
    postModulesByContexts,
} from "./api";
import { type ListReleaseUnitsAllRequest, PlatformEnvironmentType } from "./types";
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

export function useLastNotDisabledReleaseControllerMessageQuery(
    projectId: string | undefined,
    chatSessionId: string | undefined,
) {
    return useQuery({
        queryKey: QueryKeys.projectLastNotDisabledReleaseControllerMessage(projectId ?? "", chatSessionId ?? ""),
        queryFn: async () => {
            const raw = await getLastNotDisabledReleaseControllerMessage(projectId!, chatSessionId!);
            if (raw == null) return null;
            const m: ChatMessageWithDeliveryStatus = {
                ...raw,
                is_first: raw.is_first ?? false,
                delivery_status: ChatMessageDeliveryStatus.Delivered,
            };
            return m;
        },
        enabled: !!projectId && !!chatSessionId,
    });
}

export function useProjectReleasesQuery(
    projectId: string | undefined,
    environment: PlatformEnvironmentType,
    options?: { enabled?: boolean },
) {
    const enabledByOption = options?.enabled ?? true;
    return useQuery({
        queryKey: QueryKeys.projectReleases(projectId ?? "", environment),
        queryFn: () => getReleases(projectId!, environment),
        enabled: !!projectId && enabledByOption,
    });
}

export function useProjectReleaseUnitsQuery(projectId: string | undefined, releaseId: string | undefined, options?: { enabled?: boolean }) {
    const enabledByOption = options?.enabled ?? true;
    return useQuery({
        queryKey: QueryKeys.projectReleaseUnits(projectId!, releaseId!),
        queryFn: () => getReleaseUnits(projectId!, releaseId!),
        enabled: !!projectId && !!releaseId && enabledByOption,
    });
}

export function useProjectReleaseContextsQuery(projectId: string | undefined, releaseId: string | undefined, options?: { enabled?: boolean }) {
    const enabled = (options?.enabled ?? true) && !!projectId && !!releaseId;
    return useQuery({
        queryKey: QueryKeys.projectReleaseContexts(projectId ?? "", releaseId ?? ""),
        queryFn: () => getReleaseContexts(projectId!, releaseId!),
        enabled,
    });
}

export function useProjectModulesByContextsQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    contextSlugs: string[],
    options?: { enabled?: boolean },
) {
    const sortedKey = [...contextSlugs].sort().join("\u0000");
    const hasSlug = contextSlugs.some((s) => s.trim().length > 0);
    const enabled = (options?.enabled ?? true) && !!projectId && !!releaseId && hasSlug;
    return useQuery({
        queryKey: QueryKeys.projectModulesByContexts(projectId ?? "", releaseId ?? "", sortedKey),
        queryFn: () => postModulesByContexts(projectId!, releaseId!, { context_slugs: contextSlugs }),
        enabled,
    });
}

function stableReleaseUnitsAllKey(body: ListReleaseUnitsAllRequest): string {
    return JSON.stringify({
        page: body.page,
        page_size: body.page_size,
        unit_types: [...body.unit_types].sort(),
        context_slugs: [...body.context_slugs].sort(),
        context_module_pairs: [...body.context_module_pairs]
            .map((p) => ({ c: p.context_slug, m: p.module_slug }))
            .sort((a, b) => a.c.localeCompare(b.c) || a.m.localeCompare(b.m)),
    });
}

export function useProjectReleaseUnitsAllQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    body: ListReleaseUnitsAllRequest | undefined,
    options?: { enabled?: boolean },
) {
    const enabled = (options?.enabled ?? true) && !!projectId && !!releaseId && body != null;
    const requestKey = body != null ? stableReleaseUnitsAllKey(body) : "";
    return useQuery({
        queryKey: QueryKeys.projectReleaseUnitsAll(projectId ?? "", releaseId ?? "", requestKey),
        queryFn: () => postListReleaseUnitsAll(projectId!, releaseId!, body!),
        enabled,
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
