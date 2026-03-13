import { useNavigate, useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
import { LayersIcon, SidebarIcon, TextAlignJustifyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SectionTitle } from "@/components/section-title";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { ProjectUnitResponse, ProjectUnitType } from "@/modules/project/types";
import {
  useSidebar,
  SecondarySidebar,
  SecondarySidebarProvider,
  SidebarContent,
  SidebarInset,
  useSecondarySidebar,
  useRegisterSecondarySidebarShortcut,
} from "@/components/secondary-sidebar";
import { useProjectReleasesQuery, useProjectReleaseUnitsQuery } from "@/modules/project/queries";
import { useEffect, useState, useMemo } from "react";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectUnitsAndReleasesPage() {
  const mainSidebar = useSidebar();

  return (
    <SecondarySidebarProvider
      storageKey={STORAGE_KEYS.UNITS_AND_RELEASES_SIDEBAR_COLLAPSED}
      defaultOpen
    >
      <ProjectUnitsAndReleasesContent mainSidebar={mainSidebar} />
    </SecondarySidebarProvider>
  );
}

type ProjectUnitsAndReleasesContentProps = {
  mainSidebar: Sidebar;
}

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

function UnitsGroupedByType({ units }: { units: ProjectUnitResponse[] }) {
  const grouped = useMemo(() => groupUnitsByType(units), [units]);
  const sortedTypes = useMemo(
    () => [...grouped.keys()].sort((a, b) => a.localeCompare(b)),
    [grouped]
  );

  return (
    <div className="space-y-6">
      {sortedTypes.map((unitType) => (
        <div key={unitType}>
          <SectionTitle>{capitalizeFirstLetter(unitType)}</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {grouped.get(unitType)?.map((unit) => (
              <UnitCardCompact key={unit.id} unit={unit} />
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

  const { projectId, releaseVersion } = useParams<{
    projectId: string;
    releaseVersion: string;
  }>();

  const projectIdNum = projectId != null ? Number(projectId) : undefined;

  const { data: releases } = useProjectReleasesQuery(
    projectIdNum,
  );

  const { data: releaseUnits, isLoading, error } = useProjectReleaseUnitsQuery(
    projectIdNum,
    releaseVersion,
  );

  useEffect(() => {
    if (releaseVersion == null && releases != null && releases.length > 0) {
      navigate(`/dashboard/projects/${projectId}/units-releases/${releases?.[0]?.version}`, { replace: true });
    }
  }, [releaseVersion, navigate, projectId, releases]);

  return (
    <>
      <PageTitleBox
        title={`Units for release ${releaseVersion}`}
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
                  <TooltipContent side="bottom">
                    Ungrouped view
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem value="grouped">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <LayersIcon />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Group by type
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
                  <SidebarIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle releases ({SHORTCUT_LABELS.SECONDARY_SIDEBAR})
              </TooltipContent>
            </Tooltip>
          </div>
        }
      />
      <SecondarySidebar>
        <SidebarContent>
          <SecondarySideBar />
        </SidebarContent>
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
                <UnitCardCompact key={unit.id} unit={unit} />
              ))}
            </div>
          ) : (
            <UnitsGroupedByType units={releaseUnits ?? []} />
          )}
        </Container>
      </SidebarInset>
    </>
  );
}