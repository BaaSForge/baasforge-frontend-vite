import { PlatformEnvironmentType, type ProjectRuntimeResponse, type ReleaseResponse } from "./types";

/** True when this release is the `live_release` on a runtime whose env matches the release kind (stage vs prod). */
export function releaseIsLiveOnProjectRuntimes(
    release: ReleaseResponse,
    runtimes: ProjectRuntimeResponse[] | undefined,
): boolean {
    if (runtimes == null || runtimes.length === 0) return false;
    return runtimes.some((r) => {
        const envMatches = release.is_stage
            ? r.environment === PlatformEnvironmentType.stage
            : r.environment === PlatformEnvironmentType.prod;
        return envMatches && r.live_release != null && r.live_release.id === release.id;
    });
}

export function pickProductionRuntime(runtimes: ProjectRuntimeResponse[] | undefined): ProjectRuntimeResponse | null {
    return runtimes?.find((r) => r.environment === PlatformEnvironmentType.prod) ?? null;
}

export function getRuntimeLiveReleaseId(runtime: ProjectRuntimeResponse | null | undefined): string | null {
    if (runtime == null) return null;
    return runtime.live_release_id ?? runtime.live_release?.id ?? null;
}
