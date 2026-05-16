import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getRuntimeEnvVars } from "./api";

export function useProjectRuntimeEnvVarsQuery(projectId: string | undefined, isEncrypted: boolean) {
    return useQuery({
        queryKey: QueryKeys.projectRuntimeEnvVars(projectId ?? "", isEncrypted),
        queryFn: () => getRuntimeEnvVars(projectId!, { isEncrypted }),
        enabled: projectId != null,
    });
}
