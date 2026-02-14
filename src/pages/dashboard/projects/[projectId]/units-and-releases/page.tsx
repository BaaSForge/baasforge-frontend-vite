import { useNavigate, useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSidebar,
  SecondarySidebar,
  SecondarySidebarProvider,
  SidebarContent,
  SidebarInset,
  SECONDARY_SIDEBAR_STORAGE_KEYS,
  useSecondarySidebar,
} from "@/components/secondary-sidebar";
import { useProjectReleasesQuery, useProjectReleaseUnitsQuery } from "@/modules/project/queries";
import { useEffect } from "react";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectUnitsAndReleasesPage() {
  const mainSidebar = useSidebar();

  return (
    <SecondarySidebarProvider
      storageKey={SECONDARY_SIDEBAR_STORAGE_KEYS.UNITS_AND_RELEASES}
      defaultOpen
    >
      <ProjectUnitsAndReleasesContent mainSidebar={mainSidebar} />
    </SecondarySidebarProvider>
  );
}

type ProjectUnitsAndReleasesContentProps = {
  mainSidebar: Sidebar;
}

function ProjectUnitsAndReleasesContent({ mainSidebar }: ProjectUnitsAndReleasesContentProps) {
  const { toggleSidebar } = useSecondarySidebar();
  const navigate = useNavigate();

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
    if (releaseVersion == null) {
      navigate(`/dashboard/projects/${projectId}/units-releases/${releases?.[0]?.version}`, { replace: true });
    }
  }, [releaseVersion, navigate, projectId, releases]);

  return (
    <>
      <PageTitleBox
        title={`Units for release ${releaseVersion}`}
        mainSidebar={mainSidebar}
        tools={
          <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
            <SidebarIcon className="size-4" />
          </Button>
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {releaseUnits?.map((unit) => (
                <UnitCardCompact key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </Container>
      </SidebarInset>
    </>
  );
}