import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    ContextModulesByContextRow,
    ListReleaseUnitsAllRequest,
    ListReleaseUnitsAllResponse,
    ProjectDetailResponse,
} from "@/modules/project/types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";

function shareOptions(shareSecret: string) {
    return { shareSecret, skipSessionRefresh: true } as const;
}

const projectReleaseContextsEndpoint = (projectId: string, releaseId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/contexts`;
const projectReleaseModulesByContextsEndpoint = (projectId: string, releaseId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/modules-by-contexts`;
const projectReleaseUnitsAllEndpoint = (projectId: string, releaseId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/units/all`;

export function getSharedProjectDetail(projectId: string, shareSecret: string): Promise<ProjectDetailResponse> {
    return apiClient
        .get<ApiResponse<ProjectDetailResponse>>(`${PROJECTS_ENDPOINT}/${projectId}`, undefined, shareOptions(shareSecret))
        .then((res) => {
            if (!res.data) {
                throw new Error("Project response missing data");
            }
            return res.data;
        });
}

export function getSharedReleaseContexts(projectId: string, releaseId: string, shareSecret: string): Promise<string[]> {
    return apiClient
        .get<ApiResponse<{ context_slugs: string[] }>>(
            projectReleaseContextsEndpoint(projectId, releaseId),
            undefined,
            shareOptions(shareSecret),
        )
        .then((res) => res.data?.context_slugs ?? []);
}

export function postSharedModulesByContexts(
    projectId: string,
    releaseId: string,
    shareSecret: string,
    body: { context_slugs: string[] },
): Promise<ContextModulesByContextRow[]> {
    return apiClient
        .post<ApiResponse<{ by_context?: ContextModulesByContextRow[] }>>(
            projectReleaseModulesByContextsEndpoint(projectId, releaseId),
            body,
            undefined,
            shareOptions(shareSecret),
        )
        .then((res) => res.data?.by_context ?? []);
}

export function postSharedListReleaseUnitsAll(
    projectId: string,
    releaseId: string,
    shareSecret: string,
    body: ListReleaseUnitsAllRequest,
): Promise<ListReleaseUnitsAllResponse> {
    return apiClient
        .post<ApiResponse<ListReleaseUnitsAllResponse>>(
            projectReleaseUnitsAllEndpoint(projectId, releaseId),
            { ...body, exclude_deleted: true },
            undefined,
            shareOptions(shareSecret),
        )
        .then((res) => {
            if (!res.data) {
                throw new Error("Release units (all) response missing data");
            }
            return res.data;
        });
}
