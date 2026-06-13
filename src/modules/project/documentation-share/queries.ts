import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getDocumentationShareKey } from "./api";

export function useDocumentationShareKeyQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: QueryKeys.projectDocumentationShareKey(projectId ?? ""),
        queryFn: () => getDocumentationShareKey(projectId!),
        enabled: !!projectId && (options?.enabled ?? true),
    });
}
