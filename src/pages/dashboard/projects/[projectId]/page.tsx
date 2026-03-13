import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useProjectQuery } from "@/modules/project/queries";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import {
  register,
  unregister,
  UNIFIED_KEYBOARD_SCOPES,
} from "@/lib/unified-keyboard";

export default function ProjectShellPage() {
  const { projectId: projectIdParam } = useParams();
  const navigate = useNavigate();
  const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
  const projectId = projectIdParam != null ? Number(projectIdParam) : undefined;
  const { data: project } = useProjectQuery(projectId);

  useEffect(() => {
    if (project?.name == null) return;
    setSegmentLabel("projectId", project.name);
    return () => clearSegmentLabel("projectId");
  }, [project?.name, setSegmentLabel, clearSegmentLabel]);

  useEffect(() => {
    const onNewConversation = () => {
      if (projectIdParam == null) return;
      navigate(`/dashboard/projects/${projectIdParam}/conversations`);
    };
    register(UNIFIED_KEYBOARD_SCOPES.NEW_CONVERSATION, onNewConversation);
    return () => unregister(UNIFIED_KEYBOARD_SCOPES.NEW_CONVERSATION);
  }, [projectIdParam, navigate]);

  return <Outlet />;
}
