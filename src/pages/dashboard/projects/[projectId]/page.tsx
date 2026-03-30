import { useProjectQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";

export default function ProjectShellPage() {
    const { projectId: projectIdParam } = useParams();
    const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
    const projectIdOrUndefined = projectIdParam ?? undefined;
    const { data: project } = useProjectQuery(projectIdOrUndefined);
    useProjectRuntimesQuery(projectIdOrUndefined);

    useEffect(() => {
        if (project?.name == null) return;
        setSegmentLabel("projectId", project.name);
        return () => clearSegmentLabel("projectId");
    }, [project?.name, setSegmentLabel, clearSegmentLabel]);

    return <Outlet />;
}
