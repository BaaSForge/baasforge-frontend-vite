import { PlatformEnvironmentType, type ProjectRuntimeResponse } from "./types";

export function pickProductionRuntime(runtimes: ProjectRuntimeResponse[] | undefined): ProjectRuntimeResponse | null {
    return runtimes?.find((r) => r.environment === PlatformEnvironmentType.prod) ?? null;
}

export function getRuntimeLiveReleaseId(runtime: ProjectRuntimeResponse | null | undefined): string | null {
    if (runtime == null) return null;
    return runtime.live_release_id ?? runtime.live_release?.id ?? null;
}
