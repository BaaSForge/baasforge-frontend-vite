import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QueryKeys } from "@/constants/query-keys";
import { createProject, patchProject, deleteProject, detachChatSessionStageRuntime, attachChatSessionStageRuntime } from "./api";
import type { ProjectRequest, ProjectPatchRequest } from "./types";
import { toast } from "sonner";

export function useCreateProjectMutation(options?: {
  onSuccess?: (projectId: string) => void;
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

export function usePatchProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProjectPatchRequest) => patchProject(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectDetail(projectId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
    },
  });
}

export function useDeleteProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      navigate("/dashboard/projects", { replace: true });

      setTimeout(() => {
        queryClient.removeQueries({ queryKey: QueryKeys.projectDetail(projectId) });
        queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
      }, 2000);
    },
  });
}

export function useAttachChatSessionStageRuntimeMutation({
  projectId,
  chatSessionId,
  projectRuntimeId,
}: {
  projectId: string;
  chatSessionId: string;
  projectRuntimeId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attachChatSessionStageRuntime({ projectId, chatSessionId, projectRuntimeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionDetail(projectId, chatSessionId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimesWithConnectedChat(projectId) });
    },
  });
}

export function useDetachChatSessionStageRuntimeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      chatSessionId,
      projectRuntimeId,
    }:
    {
      projectId: string;
      chatSessionId: string;
      projectRuntimeId: string;
    }) => detachChatSessionStageRuntime({ projectId, chatSessionId, projectRuntimeId }),
    onSuccess: (_, {
      chatSessionId,
      projectId,
    }) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionList(projectId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectChatSessionDetail(projectId, chatSessionId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimesWithConnectedChat(projectId) });
    },
  });
}
