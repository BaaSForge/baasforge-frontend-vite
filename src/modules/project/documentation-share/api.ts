import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    DocumentationShareKeyRevealResponse,
    DocumentationShareKeyResponse,
    GenerateDocumentationShareKeyBody,
} from "./types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";
const projectDocumentationShareKeyEndpoint = (projectId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/documentation-share-key`;

export function getDocumentationShareKey(projectId: string): Promise<DocumentationShareKeyRevealResponse> {
    return apiClient
        .get<ApiResponse<DocumentationShareKeyRevealResponse>>(projectDocumentationShareKeyEndpoint(projectId))
        .then((res) => {
            if (!res.data) {
                throw new Error("Documentation share key response missing data");
            }
            return res.data;
        });
}

export function generateDocumentationShareKey(
    projectId: string,
    body: GenerateDocumentationShareKeyBody = {},
): Promise<DocumentationShareKeyResponse> {
    const payload = body.expires_at != null ? body : {};
    return apiClient
        .post<ApiResponse<DocumentationShareKeyResponse>>(projectDocumentationShareKeyEndpoint(projectId), payload)
        .then((res) => {
            if (!res.data) {
                throw new Error("Documentation share key response missing data");
            }
            return res.data;
        });
}

export function revokeDocumentationShareKey(projectId: string): Promise<void> {
    return apiClient.delete<ApiResponse<unknown>>(projectDocumentationShareKeyEndpoint(projectId)).then(() => undefined);
}
