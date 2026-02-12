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

export type ProjectUnitType = "controller";

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
