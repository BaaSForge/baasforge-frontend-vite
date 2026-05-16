import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    DeleteRuntimeEnvVarsRequest,
    DeleteRuntimeEnvVarsResponse,
    ListRuntimeEnvVarsQuery,
    RevealRuntimeEnvVarResponse,
    RuntimeEnvVarListItem,
    SaveRuntimeEnvVarsRequest,
    SaveRuntimeEnvVarsResponse,
} from "./types";
import { normalizeRuntimeEnvVarKey } from "./types";

const PROJECTS_ENDPOINT = "/v1/platform/projects";

const projectRuntimeEnvVarsEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/runtime-env-vars`;

const projectRuntimeEnvVarRevealEndpoint = (projectId: string, key: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtime-env-vars/${encodeURIComponent(key)}/runtimes/${runtimeId}/reveal`;

function listRuntimeEnvVarsUrl(projectId: string, query: ListRuntimeEnvVarsQuery): string {
    const params = new URLSearchParams();
    if (query.isEncrypted !== undefined) {
        params.set("isEncrypted", query.isEncrypted ? "true" : "false");
    }
    const qs = params.toString();
    return `${projectRuntimeEnvVarsEndpoint(projectId)}${qs ? `?${qs}` : ""}`;
}

export function getRuntimeEnvVars(projectId: string, query: ListRuntimeEnvVarsQuery): Promise<RuntimeEnvVarListItem[]> {
    return apiClient.get<ApiResponse<RuntimeEnvVarListItem[]>>(listRuntimeEnvVarsUrl(projectId, query)).then((res) => res.data ?? []);
}

export function putRuntimeEnvVars(projectId: string, body: SaveRuntimeEnvVarsRequest): Promise<SaveRuntimeEnvVarsResponse> {
    const payload: SaveRuntimeEnvVarsRequest = {
        items: body.items.map((item) => ({ ...item, key: normalizeRuntimeEnvVarKey(item.key) })),
    };
    return apiClient.put<ApiResponse<SaveRuntimeEnvVarsResponse>>(projectRuntimeEnvVarsEndpoint(projectId), payload).then((res) => {
        if (!res.data) {
            throw new Error("Save runtime env vars response missing data");
        }
        return res.data;
    });
}

export function deleteRuntimeEnvVars(projectId: string, body: DeleteRuntimeEnvVarsRequest): Promise<DeleteRuntimeEnvVarsResponse> {
    const payload: DeleteRuntimeEnvVarsRequest = {
        keys: body.keys.map((key) => normalizeRuntimeEnvVarKey(key)),
    };
    return apiClient
        .delete<ApiResponse<DeleteRuntimeEnvVarsResponse>>(projectRuntimeEnvVarsEndpoint(projectId), {
            body: JSON.stringify(payload),
        })
        .then((res) => {
            if (!res.data) {
                throw new Error("Delete runtime env vars response missing data");
            }
            return res.data;
        });
}

/** One-off fetch for reveal — never use with React Query (secrets must not be cached). */
export function revealRuntimeEnvVar(projectId: string, key: string, runtimeId: string): Promise<RevealRuntimeEnvVarResponse> {
    return apiClient
        .get<ApiResponse<RevealRuntimeEnvVarResponse>>(
            projectRuntimeEnvVarRevealEndpoint(projectId, key, runtimeId),
            {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache, no-store", Pragma: "no-cache" },
            },
            { skipErrorToast: false },
        )
        .then((res) => {
            if (!res.data) {
                throw new Error("Reveal runtime env var response missing data");
            }
            return res.data;
        });
}
