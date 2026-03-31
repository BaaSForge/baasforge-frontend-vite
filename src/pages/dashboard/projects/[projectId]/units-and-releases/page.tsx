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
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import { useProjectReleasesQuery, useProjectReleaseUnitsQuery } from "@/modules/project/queries";
import type { ProjectUnitResponse, ProjectUnitType, ReleaseResponse } from "@/modules/project/types";
import { LayersIcon, SidebarIcon, TextAlignJustifyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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

type GroupMode = "ungrouped" | "grouped";

function getStoredGroupMode(): GroupMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE);
        if (stored === "ungrouped" || stored === "grouped") return stored;
    } catch {
        // do nothing
    }
    return "ungrouped";
}

function UnitsGroupedByType({ projectId, units }: { projectId?: string; units: ProjectUnitResponse[] }) {
    const grouped = useMemo(() => groupUnitsByType(units), [units]);
    const sortedTypes = useMemo(() => [...grouped.keys()].sort((a, b) => a.localeCompare(b)), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <SectionTitle>{capitalizeFirstLetter(unitType)}</SectionTitle>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {grouped.get(unitType)?.map((unit) => (
                            <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function groupUnitsByType(units: ProjectUnitResponse[]): Map<ProjectUnitType, ProjectUnitResponse[]> {
    const map = new Map<ProjectUnitType, ProjectUnitResponse[]>();
    for (const unit of units) {
        const existing = map.get(unit.unit_type) ?? [];
        existing.push(unit);
        map.set(unit.unit_type, existing);
    }
    return map;
}

function ProjectUnitsAndReleasesContent({ mainSidebar }: ProjectUnitsAndReleasesContentProps) {
    const { toggleSidebar } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    const navigate = useNavigate();
    const [groupMode, setGroupMode] = useState<GroupMode>(getStoredGroupMode);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE, groupMode);
    }, [groupMode]);

    const { projectId, releaseID } = useParams<{
        projectId: string;
        releaseID: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;

    const { data: releases } = useProjectReleasesQuery(projectIdOrUndefined);

    const { data: releaseUnits, isLoading, error } = useProjectReleaseUnitsQuery(projectIdOrUndefined, releaseID);

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

    return (
        <NestedMainSidebarProvider mainSidebar={mainSidebar}>
            <>
                <PageTitleBox
                    title={`Units for release ${releaseTitleLabel}`}
                    mainSidebar={mainSidebar}
                    tools={
                        <div className="flex items-center gap-3">
                            <ToggleGroup
                                type="single"
                                value={groupMode}
                                onValueChange={(v) => v != null && v !== "" && setGroupMode(v as GroupMode)}
                                variant="outline"
                                size="sm"
                            >
                                <ToggleGroupItem value="ungrouped">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <TextAlignJustifyIcon />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Ungrouped view</TooltipContent>
                                    </Tooltip>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="grouped">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <LayersIcon />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Group by type</TooltipContent>
                                    </Tooltip>
                                </ToggleGroupItem>
                            </ToggleGroup>
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
                        {isLoading ? (
                            <div className="p-4 text-muted-foreground text-center text-sm">Loading units…</div>
                        ) : error ? (
                            <div className="p-4 text-destructive text-center text-sm">Failed to load units.</div>
                        ) : groupMode === "ungrouped" ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {releaseUnits?.map((unit) => (
                                    <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
                                ))}
                            </div>
                        ) : (
                            <UnitsGroupedByType projectId={projectId} units={releaseUnits ?? []} />
                        )}
                    </Container>
                </SidebarInset>
            </>
        </NestedMainSidebarProvider>
    );
}
