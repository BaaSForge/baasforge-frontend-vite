import { QueryKeys } from "@/constants/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { deleteRuntimeEnvVars, putRuntimeEnvVars } from "./api";
import type { DeleteRuntimeEnvVarsRequest, SaveRuntimeEnvVarsRequest } from "./types";

export function useSaveRuntimeEnvVarsMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: SaveRuntimeEnvVarsRequest) => putRuntimeEnvVars(projectId, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimeEnvVarsByProject(projectId) });
            toast.success("Variable saved.");
        },
    });
}

export function useDeleteRuntimeEnvVarsMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: DeleteRuntimeEnvVarsRequest) => deleteRuntimeEnvVars(projectId, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimeEnvVarsByProject(projectId) });
            toast.success("Variable removed.");
        },
    });
}
