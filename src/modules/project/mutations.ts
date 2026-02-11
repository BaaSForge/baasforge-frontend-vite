import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QueryKeys } from "@/constants/query-keys";
import { patchProject, deleteProject } from "./api";
import type { ProjectPatchRequest } from "./types";

export function usePatchProjectMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProjectPatchRequest) => patchProject(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectDetail(projectId) });
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
      navigate("/dashboard", { replace: true });
    },
  });
}
