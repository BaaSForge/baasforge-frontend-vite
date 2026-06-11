import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { useProjectReleasesQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import { getRuntimeLiveReleaseId } from "@/modules/project/runtime-release";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { PackageIcon, ServerIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { ProjectUnitsAndReleasesView } from "../../../units-and-releases/project-units-and-releases-view";

export default function ProjectRuntimeUnitsAndReleasesPage() {
    const { projectId, runtimeId } = useParams<{
        projectId: string;
        runtimeId: string;
    }>();
    const projectIdOrUndefined = projectId ?? undefined;

    const { data: runtimes, isLoading: isRuntimesLoading, error: runtimesError } = useProjectRuntimesQuery(projectIdOrUndefined);

    const runtime = useMemo(
        () => runtimes?.find((r) => r.id === runtimeId) ?? null,
        [runtimes, runtimeId],
    );

    const liveReleaseId = useMemo(() => getRuntimeLiveReleaseId(runtime), [runtime]);

    const releasesEnvironment = runtime?.environment ?? PlatformEnvironmentType.stage;
    const { data: releases } = useProjectReleasesQuery(projectIdOrUndefined, releasesEnvironment, {
        enabled: runtime != null,
    });

    const selectedRelease: ReleaseResponse | undefined = useMemo(() => {
        if (liveReleaseId == null) return undefined;
        const fromRuntime = runtime?.live_release;
        if (fromRuntime != null && fromRuntime.id === liveReleaseId) return fromRuntime;
        return releases?.find((r) => r.id === liveReleaseId);
    }, [liveReleaseId, releases, runtime?.live_release]);

    const releaseTitleLabel =
        selectedRelease != null ? String(selectedRelease.revision) : liveReleaseId != null ? "…" : "…";

    const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
    useEffect(() => {
        if (runtimeId == null) {
            clearSegmentLabel("runtimeId");
            return;
        }
        if (runtime?.name != null) {
            setSegmentLabel("runtimeId", runtime.name);
        }
        return () => clearSegmentLabel("runtimeId");
    }, [runtimeId, runtime?.name, setSegmentLabel, clearSegmentLabel]);

    if (projectIdOrUndefined == null || runtimeId == null) {
        return null;
    }

    if (isRuntimesLoading) {
        return <ContentLoadingState label="Loading runtime…" />;
    }

    if (runtimesError != null) {
        return (
            <ContentErrorState
                title="Failed to load runtime"
                subtitle="Try refreshing the page and try again."
            />
        );
    }

    if (runtime == null) {
        return (
            <ContentEmptyState
                title="Runtime not found"
                description="This runtime is not part of the project or the link is invalid."
                icon={ServerIcon}
            />
        );
    }

    if (liveReleaseId == null) {
        return (
            <ContentEmptyState
                title="No live release"
                description="This runtime has no live release yet. Deploy or attach a release to browse units here."
                icon={PackageIcon}
            />
        );
    }

    const releaseIsStage =
        selectedRelease != null ? selectedRelease.is_stage === true : runtime.environment === PlatformEnvironmentType.stage;

    return (
        <ProjectUnitsAndReleasesView
            projectId={projectId}
            releaseId={liveReleaseId}
            releaseTitleLabel={releaseTitleLabel}
            runtimeName={runtime.name}
            stageRuntimeId={runtimeId}
            releaseIsStage={releaseIsStage}
            showSecondaryReleaseSidebar={false}
        />
    );
}
