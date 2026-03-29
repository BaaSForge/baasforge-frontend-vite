import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    ProjectPatchRequest,
    ProjectRequest,
    ProjectResponse,
    ProjectRuntimeResponse,
    ProjectUnitResponse,
    ReleaseResponse,
    StageReleaseRequest,
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
const projectRuntimesEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/runtimes`;
const projectRuntimeDetachLiveReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/detach-live-release`;
const projectReleaseControllerStageReleaseEndpoint = (projectId: string, chatSessionId: string, messageId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/release-controller-messages/${messageId}/stage-release`;
const projectReleaseControllerProductionReleaseEndpoint = (projectId: string, chatSessionId: string, messageId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/release-controller-messages/${messageId}/production-release`;
const projectRuntimeDeployStageReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/deploy-stage-release`;
const projectRuntimeDeployProductionReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/deploy-production-release`;

export interface DeployReleaseBody {
    revision: number;
}

/** After detach: connect an existing stage release (same revision as deploy-stage-release). */
export type DetachRuntimeLiveReleaseDeployBody = {
    revision: number;
};

/** After detach: connect the stage release for this release-controller message scope (same scope as stage-release from message). */
export type DetachRuntimeLiveReleaseFromControllerBody = {
    chat_session_id: string;
    release_controller_message_id: string;
};

export type DetachRuntimeLiveReleaseBody =
    | DetachRuntimeLiveReleaseDeployBody
    | DetachRuntimeLiveReleaseFromControllerBody;

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

export function getProjectRuntimes(projectId: string): Promise<ProjectRuntimeResponse[]> {
    return apiClient.get<ApiResponse<ProjectRuntimeResponse[]>>(projectRuntimesEndpoint(projectId)).then((res) => res.data ?? []);
}

/** Detach the runtime’s current live release, then connect using either an existing revision or a release-controller scope. */
export function detachRuntimeLiveRelease(
    projectId: string,
    runtimeId: string,
    body: DetachRuntimeLiveReleaseBody,
): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRuntimeDetachLiveReleaseEndpoint(projectId, runtimeId), body).then(() => undefined);
}

export function postReleaseControllerStageRelease(
    projectId: string,
    chatSessionId: string,
    messageId: string,
    body: StageReleaseRequest,
): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectReleaseControllerStageReleaseEndpoint(projectId, chatSessionId, messageId), body).then(() => undefined);
}

export function postReleaseControllerProductionRelease(
    projectId: string,
    chatSessionId: string,
    messageId: string,
): Promise<void> {
    return apiClient
        .post<ApiResponse<unknown>>(projectReleaseControllerProductionReleaseEndpoint(projectId, chatSessionId, messageId))
        .then(() => undefined);
}

export function postRuntimeDeployStageRelease(projectId: string, runtimeId: string, body: DeployReleaseBody): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRuntimeDeployStageReleaseEndpoint(projectId, runtimeId), body).then(() => undefined);
}

export function postRuntimeDeployProductionRelease(projectId: string, runtimeId: string, body: DeployReleaseBody): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRuntimeDeployProductionReleaseEndpoint(projectId, runtimeId), body).then(() => undefined);
}
