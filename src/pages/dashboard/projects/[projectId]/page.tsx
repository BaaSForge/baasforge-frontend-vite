import { useEffect } from "react";
import { Outlet, useParams } from "react-router";
import { useProjectQuery } from "@/modules/project/queries";
import { useBreadcrumbActions } from "@/stores/breadcrumb";

export default function ProjectShellPage() {
  const { projectId: projectIdParam } = useParams();
  const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
  const projectId = projectIdParam != null ? Number(projectIdParam) : undefined;
  const { data: project } = useProjectQuery(projectId);

  useEffect(() => {
    if (project?.name == null) return;
    setSegmentLabel("projectId", project.name);
    return () => clearSegmentLabel("projectId");
  }, [project?.name, setSegmentLabel, clearSegmentLabel]);

  return <Outlet />;
}
