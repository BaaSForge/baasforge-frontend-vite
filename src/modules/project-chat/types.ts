export interface ChatSessionResponse {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  created_at: string;
  stage_project_runtime_id?: number | null;
}