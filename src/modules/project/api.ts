import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { ProjectResponse, ProjectPatchRequest } from "./types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";

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
