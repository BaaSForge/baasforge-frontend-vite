import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QueryKeys } from "@/constants/query-keys";
import { createProject, patchProject, deleteProject } from "./api";
import type { ProjectRequest, ProjectPatchRequest } from "./types";
import { toast } from "sonner";

export function useCreateProjectMutation(options?: {
  onSuccess?: (projectId: number) => void;
  redirect?: boolean;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const redirectOnSuccess = options?.redirect !== false;

  return useMutation({
    mutationFn: (body: ProjectRequest) => createProject(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
      options?.onSuccess?.(data.id);
      toast.success(`Project created successfully!`, { position: "top-center" });
      if (redirectOnSuccess) {
        navigate(`/dashboard/projects/${data.id}`, { replace: true });
      }
    },
  });
}

export function usePatchProjectMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProjectPatchRequest) => patchProject(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectDetail(projectId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
    },
  });
}

export function useDeleteProjectMutation(projectId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: QueryKeys.projectDetail(projectId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
      navigate("/dashboard", { replace: true });
    },
  });
}
