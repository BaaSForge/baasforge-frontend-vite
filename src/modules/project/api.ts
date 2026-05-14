import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type { ChatMessageResponse } from "@/modules/project-chat/types";
import {
    type ContextModulesByContextRow,
    type ListReleaseUnitsAllRequest,
    type ListReleaseUnitsAllResponse,
    type ProjectDetailResponse,
    type ProjectPatchRequest,
    type ProjectRequest,
    type ProjectResponse,
    type ProjectRuntimeResponse,
    type ProjectUnitResponse,
    type ReleaseResponse,
    type StageReleaseRequest,
    PlatformEnvironmentType,
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
/** `releaseId` is the release row id (UUID), not the numeric revision — revision can repeat across chat sessions. */
const projectReleaseUnitsEndpoint = (projectId: string, releaseId: string) => `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/units`;
const projectReleaseUnitPreviousByFullIdsEndpoint = (projectId: string, releaseId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/unit-previous-by-full-ids`;
const projectReleaseContextsEndpoint = (projectId: string, releaseId: string) => `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/contexts`;
const projectReleaseModulesByContextsEndpoint = (projectId: string, releaseId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/modules-by-contexts`;
const projectReleaseUnitsAllEndpoint = (projectId: string, releaseId: string) => `${PROJECTS_ENDPOINT}/${projectId}/releases/${releaseId}/units/all`;
const projectRuntimesEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/runtimes`;
const projectTracesByIdsEndpoint = (projectId: string) => `${PROJECTS_ENDPOINT}/${projectId}/traces/by-ids`;
const projectRuntimeDetachLiveReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/detach-live-release`;
const projectReleaseControllerStageReleaseEndpoint = (projectId: string, chatSessionId: string, messageId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/release-controller-messages/${messageId}/stage-release`;
const projectReleaseControllerProductionReleaseEndpoint = (projectId: string, chatSessionId: string, messageId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/release-controller-messages/${messageId}/production-release`;
const projectLastNotDisabledReleaseControllerMessageEndpoint = (projectId: string, chatSessionId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/release-controller-messages/last-not-disabled`;
const projectRejectControllerBoxRejectEndpoint = (projectId: string, chatSessionId: string, messageId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/chat-sessions/${chatSessionId}/reject-controller-messages/${messageId}/reject`;
const projectRuntimeDeployStageReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/deploy-stage-release`;
const projectRuntimeDeployProductionReleaseEndpoint = (projectId: string, runtimeId: string) =>
    `${PROJECTS_ENDPOINT}/${projectId}/runtimes/${runtimeId}/deploy-production-release`;

/** Point the runtime at an existing stage/production release by revision + owning chat session (revision is not unique per project). */
export type DeployReleaseBody = { revision: number; chat_session_id: string };

export interface ProductionReleaseControllerBody {
    stage_release_id: string;
}

/** After detach: connect an existing release by revision + owning chat session (same shape as runtime deploy endpoints). */
export type DetachRuntimeLiveReleaseDeployBody = { revision: number; chat_session_id: string };

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

export function getProject(id: string): Promise<ProjectDetailResponse> {
    return apiClient.get<ApiResponse<ProjectDetailResponse>>(`${PROJECTS_ENDPOINT}/${id}`).then((res) => {
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

export function getLastNotDisabledReleaseControllerMessage(
    projectId: string,
    chatSessionId: string,
): Promise<ChatMessageResponse | null> {
    return apiClient
        .get<ApiResponse<{ message: ChatMessageResponse | null }>>(projectLastNotDisabledReleaseControllerMessageEndpoint(projectId, chatSessionId))
        .then((res) => res.data?.message ?? null);
}

export function getReleases(projectId: string, environment: PlatformEnvironmentType): Promise<ReleaseResponse[]> {
    const url = `${projectReleasesEndpoint(projectId)}?environment=${encodeURIComponent(environment)}`;
    return apiClient.get<ApiResponse<ReleaseResponse[]>>(url).then((res) => res.data ?? []);
}

export async function getProjectLiveReleaseByRevision(
    projectId: string,
    environment: PlatformEnvironmentType,
    revision: number,
): Promise<ReleaseResponse | null> {
    const url = `${projectReleasesEndpoint(projectId)}/live-release-by-revision?environment=${encodeURIComponent(environment)}&revision=${encodeURIComponent(String(revision))}`;
    const res = await apiClient.get<ApiResponse<{ runtimes: ProjectRuntimeResponse[] }>>(url, undefined, {
        skipErrorToastForStatuses: [400, 404],
    });
    const first = res.data?.runtimes?.[0];
    const live = first?.live_release;
    if (!first || !live) return null;
    const id = first.live_release_id?.trim() || live.id;
    return { ...live, id };
}

export type ReleaseUnitPreviousByFullIdsBody = {
    unit_ids: string[];
};

export type ReleaseUnitPreviousByFullIdsResponse = {
    units: (ProjectUnitResponse | null)[];
};

export function getReleaseUnits(projectId: string, releaseId: string): Promise<ProjectUnitResponse[]> {
    return apiClient.get<ApiResponse<ProjectUnitResponse[]>>(projectReleaseUnitsEndpoint(projectId, releaseId)).then((res) => res.data ?? []);
}

export function postReleaseUnitPreviousByFullIds(
    projectId: string,
    releaseId: string,
    unitIds: string[],
): Promise<ReleaseUnitPreviousByFullIdsResponse> {
    if (unitIds.length === 0) {
        return Promise.resolve({ units: [] });
    }
    const body: ReleaseUnitPreviousByFullIdsBody = { unit_ids: unitIds };
    return apiClient
        .post<ApiResponse<ReleaseUnitPreviousByFullIdsResponse>>(projectReleaseUnitPreviousByFullIdsEndpoint(projectId, releaseId), body)
        .then((res) => res.data ?? { units: [] });
}

export function getReleaseContexts(projectId: string, releaseId: string): Promise<string[]> {
    return apiClient
        .get<ApiResponse<{ context_slugs: string[] }>>(projectReleaseContextsEndpoint(projectId, releaseId))
        .then((res) => res.data?.context_slugs ?? []);
}

export function postModulesByContexts(
    projectId: string,
    releaseId: string,
    body: { context_slugs: string[] },
): Promise<ContextModulesByContextRow[]> {
    return apiClient
        .post<ApiResponse<{ by_context?: ContextModulesByContextRow[] }>>(projectReleaseModulesByContextsEndpoint(projectId, releaseId), body)
        .then((res) => res.data?.by_context ?? []);
}

export function postListReleaseUnitsAll(
    projectId: string,
    releaseId: string,
    body: ListReleaseUnitsAllRequest,
): Promise<ListReleaseUnitsAllResponse> {
    return apiClient.post<ApiResponse<ListReleaseUnitsAllResponse>>(projectReleaseUnitsAllEndpoint(projectId, releaseId), body).then((res) => {
        if (!res.data) {
            throw new Error("Release units (all) response missing data");
        }
        return res.data;
    });
}

export function getProjectRuntimes(projectId: string): Promise<ProjectRuntimeResponse[]> {
    return apiClient.get<ApiResponse<ProjectRuntimeResponse[]>>(projectRuntimesEndpoint(projectId)).then((res) => res.data ?? []);
}

/** One row from POST `.../traces/by-ids` (API uses camelCase for this payload). */
export type LoadedProjectTraceEntry = {
    traceId: string;
    trace: unknown;
    release?: ReleaseResponse | null;
    runtime?: ProjectRuntimeResponse | null;
    unit?: ProjectUnitResponse | null;
};

function readTraceId(entry: Record<string, unknown>): string {
    const a = entry.traceId;
    const b = entry.trace_id;
    if (typeof a === "string" && a.trim() !== "") return a.trim();
    if (typeof b === "string" && b.trim() !== "") return b.trim();
    return "";
}

function normalizeLoadedTraceEntry(raw: unknown): LoadedProjectTraceEntry | null {
    if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
    const o = raw as Record<string, unknown>;
    const traceId = readTraceId(o);
    if (!traceId) return null;
    return {
        traceId,
        trace: o.trace,
        release: (o.release ?? null) as ReleaseResponse | null,
        runtime: (o.runtime ?? null) as ProjectRuntimeResponse | null,
        unit: (o.unit ?? null) as ProjectUnitResponse | null,
    };
}

export async function postLoadProjectTracesByIds(projectId: string, traceIds: string[]): Promise<LoadedProjectTraceEntry[]> {
    const res = await apiClient.post<ApiResponse<{ traces?: unknown[] }>>(
        projectTracesByIdsEndpoint(projectId),
        { traceIds },
        undefined,
        { skipErrorToast: true },
    );
    const rawList = res.data?.traces;
    if (!Array.isArray(rawList)) return [];
    const out: LoadedProjectTraceEntry[] = [];
    for (const item of rawList) {
        const row = normalizeLoadedTraceEntry(item);
        if (row != null) out.push(row);
    }
    return out;
}

/** Detach the runtime’s current live release, then connect via ByRevision (`revision` + `chat_session_id`) or a release-controller scope. */
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
    body: ProductionReleaseControllerBody,
): Promise<void> {
    return apiClient
        .post<ApiResponse<unknown>>(projectReleaseControllerProductionReleaseEndpoint(projectId, chatSessionId, messageId), body)
        .then(() => undefined);
}

export function postRejectControllerBoxReject(projectId: string, chatSessionId: string, messageId: string): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRejectControllerBoxRejectEndpoint(projectId, chatSessionId, messageId), {}).then(() => undefined);
}

export function postRuntimeDeployStageRelease(projectId: string, runtimeId: string, body: DeployReleaseBody): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRuntimeDeployStageReleaseEndpoint(projectId, runtimeId), body).then(() => undefined);
}

export function postRuntimeDeployProductionRelease(projectId: string, runtimeId: string, body: DeployReleaseBody): Promise<void> {
    return apiClient.post<ApiResponse<unknown>>(projectRuntimeDeployProductionReleaseEndpoint(projectId, runtimeId), body).then(() => undefined);
}
