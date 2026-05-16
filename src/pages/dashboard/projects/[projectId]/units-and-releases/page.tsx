import { SecondarySidebarProvider, useSidebar } from "@/components/secondary-sidebar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useProductionRuntimeQuery, useProjectReleasesQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import { getRuntimeLiveReleaseId, getServingRuntimeIdForRelease } from "@/modules/project/runtime-release";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { PackageIcon } from "lucide-react";
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
    const { data: runtimes } = useProjectRuntimesQuery(projectIdOrUndefined);

    const liveReleaseId = useMemo(() => getRuntimeLiveReleaseId(productionRuntime), [productionRuntime]);

    useEffect(() => {
        if (releaseID != null) return;
        if (isProductionRuntimeLoading) return;
        if (liveReleaseId == null) return;

        navigate(
            {
                pathname: `/dashboard/projects/${projectId}/units-releases/${liveReleaseId}`,
                search: location.search,
            },
            { replace: true },
        );
    }, [
        releaseID,
        navigate,
        projectId,
        liveReleaseId,
        location.search,
        isProductionRuntimeLoading,
    ]);

    const selectedRelease: ReleaseResponse | undefined = useMemo(
        () => releases?.find((r) => r.id === releaseID),
        [releases, releaseID],
    );
    const releaseTitleLabel = selectedRelease != null ? String(selectedRelease.revision) : "…";

    const releaseIsLive =
        releaseID != null && liveReleaseId != null && releaseID === liveReleaseId;

    const stageRuntimeIdForSelectedRelease = useMemo(
        () => getServingRuntimeIdForRelease(selectedRelease, runtimes),
        [selectedRelease, runtimes],
    );

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

    if (projectIdOrUndefined == null) {
        return null;
    }

    if (releaseID == null && (isProductionRuntimeLoading || liveReleaseId != null)) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading production runtime…</div>;
    }

    if (releaseID == null && liveReleaseId == null) {
        return (
            <Empty className="border-none min-h-[50vh]">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageIcon />
                    </EmptyMedia>
                    <EmptyTitle>No live release</EmptyTitle>
                    <EmptyDescription>
                        Production has no live release yet. Deploy or attach a release to browse units here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <ProjectUnitsAndReleasesView
            projectId={projectId}
            releaseId={releaseID}
            releaseTitleLabel={releaseTitleLabel}
            runtimeName={productionRuntime?.name}
            stageRuntimeId={stageRuntimeIdForSelectedRelease}
            releaseIsStage={selectedRelease?.is_stage === true}
            releaseIsLive={releaseIsLive}
            mainSidebar={mainSidebar}
            showSecondaryReleaseSidebar
        />
    );
}
