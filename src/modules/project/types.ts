export type FrameworkType = "mvc";

export type LanguageType = "rust";

export interface ProjectResponse {
  id: number;
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
  id: number;
  project_id: number;
  code: string | null;
  explanation: string | null;
  version: string;
  parent_unit_id: number | null;
  unit_type: ProjectUnitType;
  is_draft: boolean;
  chat_session_id: number | null;
}

export interface ReleaseResponse {
  id: number;
  project_id: number;
  notes: string | null;
  version: string;
  created_at: string;
}

export type PlatformEnvironmentType = "stage" | "prod";

export type DeploymentStatusType =
  | "deploying"
  | "stopped"
  | "pruned"
  | "up"
  | "failed";

export interface ProjectRuntimeResponse {
  id: number;
  project_id: number;
  name: string;
  slug: string;
  environment: PlatformEnvironmentType;
  db_cluster_id: number | null;
  db_cluster_deployment_status: DeploymentStatusType | null;
  server_cluster_id: number | null;
  server_cluster_deployment_status: DeploymentStatusType | null;
  live_release_version: string | null;
}