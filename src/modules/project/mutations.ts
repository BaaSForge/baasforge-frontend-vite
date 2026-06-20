import { QueryKeys } from "@/constants/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "@/lib/toast";
import { events, triggerAppEvent } from "@/services/events";
import { createProject, deleteProject, patchProject } from "./api";
import type { ProjectPatchRequest, ProjectRequest } from "./types";

export function useCreateProjectMutation(options?: { onSuccess?: (projectId: string) => void; redirect?: boolean }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const redirectOnSuccess = options?.redirect !== false;

    return useMutation({
        mutationFn: (body: ProjectRequest) => createProject(body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
            triggerAppEvent(events.PROJECT_CREATED_EVENT, { projectId: data.id });
            options?.onSuccess?.(data.id);
            toast.success(`Project created successfully!`);
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

