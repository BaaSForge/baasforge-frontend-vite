import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
    SecondarySidebar,
    SidebarInset,
    useRegisterSecondarySidebarShortcut,
    useSecondarySidebar,
} from "@/components/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { useProjectReleaseUnitsQuery } from "@/modules/project/queries";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { SidebarIcon } from "lucide-react";
import { useSearchParams } from "react-router";
import { AllUnitsNonLiveReleaseTitleBadge } from "./all-units-non-live-release-title-badge";
import { AllUnitsTab } from "./all-units-tab";
import { NewUnitsTab } from "./new-units-tab";
import { mergeAllUnitsSearchParams, readReleaseUnitsSearchParams, type UnitsTabValue } from "./release-units-search-params";
import { SecondarySideBar } from "./secondary-side-bar";
import { UnitsGroupModeToggle } from "./units-group-mode-toggle";

export type ProjectUnitsAndReleasesViewProps = {
    projectId?: string;
    releaseId?: string;
    releaseTitleLabel: string;
    runtimeName?: string;
    /** Stage trigger path needs the runtime id; only set on the runtime-scoped units route. */
    stageRuntimeId?: string;
    /** From the open release row (`is_stage`); selects stage vs production trigger base path. */
    releaseIsStage?: boolean;
    /** False when the open release is not the runtime’s live release. */
    releaseIsLive?: boolean;
    showSecondaryReleaseSidebar: boolean;
};

export function ProjectUnitsAndReleasesView({
    projectId,
    releaseId,
    releaseTitleLabel,
    runtimeName,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive = true,
    showSecondaryReleaseSidebar,
}: ProjectUnitsAndReleasesViewProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { unitsTab } = readReleaseUnitsSearchParams(searchParams);

    const { data: newUnitsReleaseUnits, isLoading: newUnitsIsLoading, error: newUnitsError } = useProjectReleaseUnitsQuery(
        projectId,
        releaseId,
        { enabled: unitsTab === "new" && releaseId != null },
    );

    const onUnitsTabChange = (v: string) => {
        if (v !== "new" && v !== "all") return;
        setSearchParams(mergeAllUnitsSearchParams(searchParams, { unitsTab: v as UnitsTabValue }));
    };

    const tabsControls = (
        <>
            <UnitsGroupModeToggle />
            <TabsList>
                <TabsTrigger value="new">New units</TabsTrigger>
                <TabsTrigger value="all">All units</TabsTrigger>
            </TabsList>
        </>
    );

    const titleTools = showSecondaryReleaseSidebar ? (
        <SecondaryReleaseSidebarToggleDecorator tabsControls={tabsControls} />
    ) : (
        tabsControls
    );

    const trimmedRuntimeName = runtimeName?.trim() ?? "";
    const pageTitle =
        trimmedRuntimeName.length > 0
            ? `Release ${releaseTitleLabel} on ${trimmedRuntimeName}`
            : `Release ${releaseTitleLabel}`;

    const tabPanels = (
        <ProjectUnitsAndReleasesTabPanels
            projectId={projectId}
            releaseId={releaseId}
            stageRuntimeId={stageRuntimeId}
            releaseIsStage={releaseIsStage}
            releaseIsLive={releaseIsLive}
            newUnitsReleaseUnits={newUnitsReleaseUnits}
            newUnitsIsLoading={newUnitsIsLoading}
            newUnitsError={newUnitsError}
        />
    );

    const body = (
        <>
            <PageTitleBox
                title={pageTitle}
                stackToolsOnMobile
                tools={
                    <div className="flex min-w-0 shrink-0 items-center gap-2">
                        {!releaseIsLive && unitsTab === "all" ? <AllUnitsNonLiveReleaseTitleBadge /> : null}
                        {titleTools}
                    </div>
                }
            />
            {showSecondaryReleaseSidebar ? (
                <>
                    <SecondarySidebar>
                        <SecondarySideBar />
                    </SecondarySidebar>
                    <SidebarInset className="here-is-the-content">{tabPanels}</SidebarInset>
                </>
            ) : (
                <main className="bg-background relative flex min-w-0 w-full flex-1 flex-col here-is-the-content">{tabPanels}</main>
            )}
        </>
    );

    return (
        <Tabs value={unitsTab} onValueChange={onUnitsTabChange}>
            {body}
        </Tabs>
    );
}

function SecondaryReleaseSidebarToggleDecorator({ tabsControls }: { tabsControls: React.ReactNode }) {
    const { toggleSidebar } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    return (
        <>
            {tabsControls}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
                        <SidebarIcon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Toggle releases ({SHORTCUT_LABELS.SECONDARY_SIDEBAR})</TooltipContent>
            </Tooltip>
        </>
    );
}

function ProjectUnitsAndReleasesTabPanels({
    projectId,
    releaseId,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive,
    newUnitsReleaseUnits,
    newUnitsIsLoading,
    newUnitsError,
}: {
    projectId?: string;
    releaseId?: string;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    releaseIsLive?: boolean;
    newUnitsReleaseUnits: ProjectUnitResponse[] | undefined;
    newUnitsIsLoading: boolean;
    newUnitsError: unknown;
}) {
    return (
        <Container>
            <TabsContent value="new" className="mt-0">
                <NewUnitsTab
                    projectId={projectId}
                    releaseId={releaseId ?? undefined}
                    releaseUnits={newUnitsReleaseUnits}
                    isLoading={newUnitsIsLoading}
                    error={newUnitsError}
                />
            </TabsContent>
            <TabsContent value="all" className="mt-0">
                {projectId != null && releaseId != null ? (
                    <AllUnitsTab
                        projectId={projectId}
                        releaseId={releaseId}
                        stageRuntimeId={stageRuntimeId}
                        releaseIsStage={releaseIsStage}
                        releaseIsLive={releaseIsLive}
                    />
                ) : (
                    <div className="text-muted-foreground text-sm">Select a release to view all units.</div>
                )}
            </TabsContent>
        </Container>
    );
}
