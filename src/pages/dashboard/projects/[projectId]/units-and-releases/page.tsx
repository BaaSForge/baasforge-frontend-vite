import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
    NestedMainSidebarProvider,
    SecondarySidebar,
    SecondarySidebarProvider,
    SidebarInset,
    useRegisterSecondarySidebarShortcut,
    useSecondarySidebar,
    useSidebar,
} from "@/components/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { useProjectReleasesQuery, useProjectReleaseUnitsQuery } from "@/modules/project/queries";
import { type ReleaseResponse, PlatformEnvironmentType } from "@/modules/project/types";
import { SidebarIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AllUnitsTab } from "./all-units-tab";
import { NewUnitsTab } from "./new-units-tab";
import { mergeAllUnitsSearchParams, readReleaseUnitsSearchParams, type UnitsTabValue } from "./release-units-search-params";
import { SecondarySideBar } from "./secondary-side-bar";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectUnitsAndReleasesPage() {
    const mainSidebar = useSidebar();

    return (
        <SecondarySidebarProvider storageKey={STORAGE_KEYS.UNITS_AND_RELEASES_SIDEBAR_COLLAPSED} defaultOpen>
            <ProjectUnitsAndReleasesContent mainSidebar={mainSidebar} />
        </SecondarySidebarProvider>
    );
}

type ProjectUnitsAndReleasesContentProps = {
    mainSidebar: Sidebar;
};

function ProjectUnitsAndReleasesContent({ mainSidebar }: ProjectUnitsAndReleasesContentProps) {
    const { toggleSidebar } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { unitsTab } = readReleaseUnitsSearchParams(searchParams);

    const { projectId, releaseID } = useParams<{
        projectId: string;
        releaseID: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;

    const { data: releases } = useProjectReleasesQuery(projectIdOrUndefined, PlatformEnvironmentType.prod);

    const { data: releaseUnits, isLoading, error } = useProjectReleaseUnitsQuery(projectIdOrUndefined, releaseID, {
        enabled: unitsTab === "new",
    });

    useEffect(() => {
        if (releaseID == null && releases != null && releases.length > 0) {
            navigate(`/dashboard/projects/${projectId}/units-releases/${releases[0].id}`, { replace: true });
        }
    }, [releaseID, navigate, projectId, releases]);

    const selectedRelease: ReleaseResponse | undefined = useMemo(
        () => releases?.find((r) => r.id === releaseID),
        [releases, releaseID],
    );
    const releaseTitleLabel = selectedRelease != null ? String(selectedRelease.revision) : "…";

    const onUnitsTabChange = (v: string) => {
        if (v !== "new" && v !== "all") return;
        setSearchParams(mergeAllUnitsSearchParams(searchParams, { unitsTab: v as UnitsTabValue }));
    };

    return (
        <NestedMainSidebarProvider mainSidebar={mainSidebar}>
            <>
                <Tabs value={unitsTab} onValueChange={onUnitsTabChange} className="gap-4">
                    <PageTitleBox
                        title={`Release ${releaseTitleLabel}`}
                        mainSidebar={mainSidebar}
                        tools={
                            <div className="flex items-center gap-2">
                                <TabsList>
                                    <TabsTrigger value="new">New units</TabsTrigger>
                                    <TabsTrigger value="all">All units</TabsTrigger>
                                </TabsList>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
                                            <SidebarIcon className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Toggle releases ({SHORTCUT_LABELS.SECONDARY_SIDEBAR})</TooltipContent>
                                </Tooltip>
                            </div>
                        }
                    />
                    <SecondarySidebar>
                        <SecondarySideBar />
                    </SecondarySidebar>
                    <SidebarInset className="here-is-the-content">
                        <Container>
                            <TabsContent value="new" className="mt-0">
                                <NewUnitsTab projectId={projectId} releaseUnits={releaseUnits} isLoading={isLoading} error={error} />
                            </TabsContent>
                            <TabsContent value="all" className="mt-0">
                                {projectId != null && releaseID != null ? (
                                    <AllUnitsTab projectId={projectId} releaseId={releaseID} />
                                ) : (
                                    <div className="text-muted-foreground text-sm">Select a release to view all units.</div>
                                )}
                            </TabsContent>
                        </Container>
                    </SidebarInset>
                </Tabs>
            </>
        </NestedMainSidebarProvider>
    );
}
