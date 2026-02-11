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
