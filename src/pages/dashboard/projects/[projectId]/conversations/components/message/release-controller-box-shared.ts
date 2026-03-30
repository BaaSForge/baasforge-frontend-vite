"use client";

import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType, type ReleaseResponse } from "@/modules/project/types";
import type { ReleaseControllerBoxPayload } from "@/modules/project-chat/payloads";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { useMemo } from "react";

/** Payload object for release-controller messages — shared with `release-controller-box-message` and sticky preview. */
export function getReleaseControllerPayload(message: ChatMessageWithDeliveryStatus): ReleaseControllerBoxPayload {
    const p = message.payload as ReleaseControllerBoxPayload | undefined | null;
    if (p == null || typeof p !== "object") return {};
    return p;
}

/** Stage/prod runtimes and whether each release revision is currently live (same logic as the in-thread box). */
export function useReleaseControllerRuntimeLiveFlags(
    projectId: string | undefined,
    stageRelease: ReleaseResponse | null | undefined,
    prodRelease: ReleaseResponse | null | undefined,
) {
    const { data: runtimes } = useProjectRuntimesQuery(projectId);

    const stageRuntimes = useMemo(
        () => (runtimes ?? []).filter((r) => r.environment === PlatformEnvironmentType.stage),
        [runtimes],
    );
    const prodRuntimes = useMemo(
        () => (runtimes ?? []).filter((r) => r.environment === PlatformEnvironmentType.prod),
        [runtimes],
    );

    const isStageReleaseLiveOnRuntime = useMemo(() => {
        if (stageRelease == null) return false;
        return stageRuntimes.some((r) => r.liveRelease != null && r.liveRelease.id === stageRelease.id);
    }, [stageRelease, stageRuntimes]);

    const isProdReleaseLiveOnRuntime = useMemo(() => {
        if (prodRelease == null) return false;
        return prodRuntimes.some((r) => r.liveRelease != null && r.liveRelease.id === prodRelease.id);
    }, [prodRelease, prodRuntimes]);

    return { stageRuntimes, prodRuntimes, isStageReleaseLiveOnRuntime, isProdReleaseLiveOnRuntime };
}
