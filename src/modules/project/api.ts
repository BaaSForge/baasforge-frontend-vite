import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type {
  ProjectResponse,
  ProjectRequest,
  ProjectPatchRequest,
  ProjectUnitResponse,
  ReleaseResponse,
} from "./types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";
const projectUnitsEndpoint = (projectId: number) => `${PROJECTS_ENDPOINT}/${projectId}/units`;
const projectDraftUnitsEndpoint = (projectId: number, chatSessionId: number) =>
  `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/draft-units`;
const projectReleasesEndpoint = (projectId: number) => `${PROJECTS_ENDPOINT}/${projectId}/releases`;

export function createProject(body: ProjectRequest): Promise<ProjectResponse> {
  return apiClient
    .post<ApiResponse<ProjectResponse>>(PROJECTS_ENDPOINT, body)
    .then((res) => {
      if (!res.data) {
        throw new Error("Project response missing data");
      }
      return res.data;
    });
}

export function getProjects(): Promise<ProjectResponse[]> {
  return apiClient
    .get<ApiResponse<ProjectResponse[]>>(PROJECTS_ENDPOINT)
    .then((res) => res.data ?? []);
}

export function getProject(id: number): Promise<ProjectResponse> {
  return apiClient
    .get<ApiResponse<ProjectResponse>>(`${PROJECTS_ENDPOINT}/${id}`)
    .then((res) => {
      if (!res.data) {
        throw new Error("Project response missing data");
      }
      return res.data;
    });
}

export function patchProject(
  id: number,
  body: ProjectPatchRequest
): Promise<ProjectResponse> {
  return apiClient
    .patch<ApiResponse<ProjectResponse>>(`${PROJECTS_ENDPOINT}/${id}`, body)
    .then((res) => {
      if (!res.data) {
        throw new Error("Project response missing data");
      }
      return res.data;
    });
}

export function deleteProject(id: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<unknown>>(`${PROJECTS_ENDPOINT}/${id}`)
    .then(() => undefined);
}

export function getProjectUnits(projectId: number): Promise<ProjectUnitResponse[]> {
  return apiClient
    .get<ApiResponse<ProjectUnitResponse[]>>(projectUnitsEndpoint(projectId))
    .then((res) => res.data ?? []);
}

export function getDraftUnits(
  projectId: number,
  chatSessionId: number
): Promise<ProjectUnitResponse[]> {
  return apiClient
    .get<ApiResponse<ProjectUnitResponse[]>>(
      projectDraftUnitsEndpoint(projectId, chatSessionId)
    )
    .then((res) => res.data ?? []);
}


export function getReleases(
  projectId: number,
): Promise<ReleaseResponse[]> {
  return apiClient
    .get<ApiResponse<ReleaseResponse[]>>(
      projectReleasesEndpoint(projectId)
    )
    .then((res) => res.data ?? []);
}
