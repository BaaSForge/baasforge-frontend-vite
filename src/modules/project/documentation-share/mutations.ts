import { QueryKeys } from "@/constants/query-keys";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateDocumentationShareKey, revokeDocumentationShareKey } from "./api";
import type { GenerateDocumentationShareKeyBody } from "./types";

export function useGenerateDocumentationShareKeyMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: GenerateDocumentationShareKeyBody) => generateDocumentationShareKey(projectId, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDocumentationShareKey(projectId) });
            toast.success("Documentation share link updated.");
        },
    });
}

export function useRevokeDocumentationShareKeyMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => revokeDocumentationShareKey(projectId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectDocumentationShareKey(projectId) });
            toast.success("Documentation share link revoked.");
        },
    });
}
