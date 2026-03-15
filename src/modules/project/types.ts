import type { ChatSessionResponse } from "@/modules/project-chat/types";

export type FrameworkType = "mvc";

export type LanguageType = "rust";

export interface ProjectResponse {
    id: string;
    framework: FrameworkType;
    name: string;
    slug: string;
    language: LanguageType;
}

export interface ProjectRequest {
    framework: FrameworkType;
    name: string;
    slug: string;
    language: LanguageType;
}

export interface ProjectPatchRequest {
    name: string;
}

export type ProjectUnitType = "controller" | "model" | "view";

export interface ProjectUnitResponse {
    id: string;
    project_id: string;
    code: string | null;
    explanation: string | null;
    version: string;
    parent_unit_id: string | null;
    unit_type: ProjectUnitType;
    is_draft: boolean;
    chat_session_id: string | null;
}

export interface ReleaseResponse {
    id: string;
    project_id: string;
    notes: string | null;
    version: string;
    created_at: string;
}

export enum PlatformEnvironmentType {
    stage = "stage",
    prod = "prod",
}

export type DeploymentStatusType = "deploying" | "stopped" | "pruned" | "up" | "failed";

export interface ProjectRuntimeResponse {
    id: string;
    project_id: string;
    name: string;
    slug: string;
    environment: PlatformEnvironmentType;
    db_cluster_id: string | null;
    db_cluster_deployment_status: DeploymentStatusType | null;
    server_cluster_id: string | null;
    server_cluster_deployment_status: DeploymentStatusType | null;
    live_release_version: string | null;
}

export interface ProjectRuntimeWithConnectedChatResponse extends ProjectRuntimeResponse {
    connected_chat_session?: ChatSessionResponse;
}
