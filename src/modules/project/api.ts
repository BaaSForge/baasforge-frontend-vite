import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    ProjectPatchRequest,
    ProjectRequest,
    ProjectResponse,
    ProjectRuntimeWithConnectedChatResponse,
    ProjectUnitResponse,
    ReleaseResponse,
} from "./types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";
const projectNonDraftUnitsEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/non-draft-units`;
const projectDraftUnitsEndpoint = (projectId: string, chatSessionId: string) => `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/draft-units`;
const projectDraftUnitsAsOfReleaseControllerMessageEndpoint = (
    projectId: string,
    chatSessionId: string,
    releaseControllerMessageId: string,
) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/draft-units/as-of-release-controller-message/${releaseControllerMessageId}`;
const projectReleasesEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/releases`;
const projectReleaseUnitsEndpoint = (projectId: string, releaseRevision: string) => `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseRevision}/units`;
const projectRuntimesWithConnectedChatEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/runtimes-with-connected-chat-sessions`;

export function createProject(body: ProjectRequest): Promise<ProjectResponse> {
    return apiClient.post<ApiResponse<ProjectResponse>>(PROJECTS_ENDPOINT, body).then((res) => {
        if (!res.data) {
            throw new Error("Project response missing data");
        }
        return res.data;
    });
}

export function getProjects(): Promise<ProjectResponse[]> {
    return apiClient.get<ApiResponse<ProjectResponse[]>>(PROJECTS_ENDPOINT).then((res) => res.data ?? []);
}

export function getProject(id: string): Promise<ProjectResponse> {
    return apiClient.get<ApiResponse<ProjectResponse>>(`${PROJECTS_ENDPOINT}/${id}`).then((res) => {
        if (!res.data) {
            throw new Error("Project response missing data");
        }
        return res.data;
    });
}

export function patchProject(id: string, body: ProjectPatchRequest): Promise<ProjectResponse> {
    return apiClient.patch<ApiResponse<ProjectResponse>>(`${PROJECTS_ENDPOINT}/${id}`, body).then((res) => {
        if (!res.data) {
            throw new Error("Project response missing data");
        }
        return res.data;
    });
}

export function deleteProject(id: string): Promise<void> {
    return apiClient.delete<ApiResponse<unknown>>(`${PROJECTS_ENDPOINT}/${id}`).then(() => undefined);
}

export function detachChatSessionStageRuntime({
    projectId,
    chatSessionId,
    projectRuntimeId,
}: {
    projectId: string;
    chatSessionId: string;
    projectRuntimeId: string;
}): Promise<void> {
    return apiClient
        .post<ApiResponse<unknown>>(`${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/detach-stage-runtime`, {
            project_runtime_id: projectRuntimeId,
        })
        .then(() => undefined);
}

export function attachChatSessionStageRuntime({
    projectId,
    chatSessionId,
    projectRuntimeId,
}: {
    projectId: string;
    chatSessionId: string;
    projectRuntimeId: string;
}): Promise<void> {
    return apiClient
        .post<ApiResponse<unknown>>(`${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/attach-stage-runtime`, {
            project_runtime_id: projectRuntimeId,
        })
        .then(() => undefined);
}

export function getProjectNonDraftUnits(projectId: string): Promise<ProjectUnitResponse[]> {
    return apiClient.get<ApiResponse<ProjectUnitResponse[]>>(projectNonDraftUnitsEndpoint(projectId)).then((res) => res.data ?? []);
}

export function getDraftUnits(projectId: string, chatSessionId: string): Promise<ProjectUnitResponse[]> {
    return apiClient.get<ApiResponse<ProjectUnitResponse[]>>(projectDraftUnitsEndpoint(projectId, chatSessionId)).then((res) => res.data ?? []);
}

export function getDraftUnitsAsOfReleaseControllerMessage(
    projectId: string,
    chatSessionId: string,
    releaseControllerMessageId: string,
): Promise<ProjectUnitResponse[]> {
    return apiClient
        .get<ApiResponse<ProjectUnitResponse[]>>(projectDraftUnitsAsOfReleaseControllerMessageEndpoint(projectId, chatSessionId, releaseControllerMessageId))
        .then((res) => res.data ?? []);
}

export function getReleases(projectId: string): Promise<ReleaseResponse[]> {
    return apiClient.get<ApiResponse<ReleaseResponse[]>>(projectReleasesEndpoint(projectId)).then((res) => res.data ?? []);
}

export function getReleaseUnits(projectId: string, releaseRevision: string): Promise<ProjectUnitResponse[]> {
    return apiClient.get<ApiResponse<ProjectUnitResponse[]>>(projectReleaseUnitsEndpoint(projectId, releaseRevision)).then((res) => res.data ?? []);
}

export function getRuntimesWithConnectedChat(projectId: string): Promise<ProjectRuntimeWithConnectedChatResponse[]> {
    return apiClient
        .get<ApiResponse<ProjectRuntimeWithConnectedChatResponse[]>>(projectRuntimesWithConnectedChatEndpoint(projectId))
        .then((res) => res.data ?? []);
}
