import { SecondarySidebarProvider, useSidebar } from "@/components/secondary-sidebar";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useProductionRuntimeQuery, useProjectReleasesQuery } from "@/modules/project/queries";
import { getRuntimeLiveReleaseId } from "@/modules/project/runtime-release";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ProjectUnitsAndReleasesView } from "./project-units-and-releases-view";

export default function ProjectUnitsAndReleasesPage() {
    const mainSidebar = useSidebar();

    return (
        <SecondarySidebarProvider storageKey={STORAGE_KEYS.UNITS_AND_RELEASES_SIDEBAR_COLLAPSED} defaultOpen>
            <ProjectUnitsAndReleasesProductionContent mainSidebar={mainSidebar} />
        </SecondarySidebarProvider>
    );
}

type ProjectUnitsAndReleasesProductionContentProps = {
    mainSidebar: ReturnType<typeof useSidebar>;
};

function ProjectUnitsAndReleasesProductionContent({ mainSidebar }: ProjectUnitsAndReleasesProductionContentProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const { projectId, releaseID } = useParams<{
        projectId: string;
        releaseID: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;

    const { data: releases } = useProjectReleasesQuery(projectIdOrUndefined, PlatformEnvironmentType.prod);
    const { data: productionRuntime, isLoading: isProductionRuntimeLoading } = useProductionRuntimeQuery(projectIdOrUndefined);

    useEffect(() => {
        if (releaseID != null) return;
        if (releases == null || releases.length === 0) return;
        if (isProductionRuntimeLoading) return;

        const liveId = getRuntimeLiveReleaseId(productionRuntime);
        const targetId = liveId != null && releases.some((r) => r.id === liveId) ? liveId : releases[0].id;

        navigate(
            {
                pathname: `/dashboard/projects/${projectId}/units-releases/${targetId}`,
                search: location.search,
            },
            { replace: true },
        );
    }, [releaseID, navigate, projectId, releases, location.search, productionRuntime, isProductionRuntimeLoading]);

    const selectedRelease: ReleaseResponse | undefined = useMemo(
        () => releases?.find((r) => r.id === releaseID),
        [releases, releaseID],
    );
    const releaseTitleLabel = selectedRelease != null ? String(selectedRelease.revision) : "…";

    const liveReleaseId = getRuntimeLiveReleaseId(productionRuntime);
    const releaseIsLive =
        releaseID != null && liveReleaseId != null && releaseID === liveReleaseId;

    const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
    useEffect(() => {
        if (releaseID == null) {
            clearSegmentLabel("releaseID");
            return;
        }
        if (selectedRelease != null) {
            setSegmentLabel("releaseID", `Release ${String(selectedRelease.revision)}`);
        }
        return () => clearSegmentLabel("releaseID");
    }, [releaseID, selectedRelease, setSegmentLabel, clearSegmentLabel]);

    return (
        <ProjectUnitsAndReleasesView
            projectId={projectId}
            releaseId={releaseID}
            releaseTitleLabel={releaseTitleLabel}
            runtimeName={productionRuntime?.name}
            releaseIsStage={selectedRelease?.is_stage === true}
            releaseIsLive={releaseIsLive}
            mainSidebar={mainSidebar}
            showSecondaryReleaseSidebar
        />
    );
}
