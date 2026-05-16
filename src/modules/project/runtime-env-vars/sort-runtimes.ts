import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { PlatformEnvironmentType } from "@/modules/project/types";

export function sortRuntimesForEnvVars(runtimes: ProjectRuntimeResponse[]): ProjectRuntimeResponse[] {
    return [...runtimes].sort((a, b) => {
        if (a.environment !== b.environment) {
            if (a.environment === PlatformEnvironmentType.prod) return -1;
            if (b.environment === PlatformEnvironmentType.prod) return 1;
        }
        return a.name.localeCompare(b.name);
    });
}
