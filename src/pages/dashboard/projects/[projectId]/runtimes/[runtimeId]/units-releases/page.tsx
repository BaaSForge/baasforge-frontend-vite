import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useProjectReleasesQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import { getRuntimeLiveReleaseId } from "@/modules/project/runtime-release";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { PackageIcon } from "lucide-react";
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
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading runtime…</div>;
    }

    if (runtimesError != null) {
        return <div className="p-4 text-center text-sm text-destructive">Failed to load runtimes.</div>;
    }

    if (runtime == null) {
        return (
            <Empty className="border-none min-h-[50vh]">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageIcon />
                    </EmptyMedia>
                    <EmptyTitle>Runtime not found</EmptyTitle>
                    <EmptyDescription>This runtime is not part of the project or the link is invalid.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (liveReleaseId == null) {
        return (
            <Empty className="border-none min-h-[50vh]">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageIcon />
                    </EmptyMedia>
                    <EmptyTitle>No live release</EmptyTitle>
                    <EmptyDescription>
                        This runtime has no live release yet. Deploy or attach a release to browse units here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <ProjectUnitsAndReleasesView
            projectId={projectId}
            releaseId={liveReleaseId}
            releaseTitleLabel={releaseTitleLabel}
            runtimeName={runtime.name}
            showSecondaryReleaseSidebar={false}
        />
    );
}
