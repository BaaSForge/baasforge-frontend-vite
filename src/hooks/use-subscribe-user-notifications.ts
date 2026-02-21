import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { notificationsUserTopic, isProjectDeletedEvent, isRuntimeCreatedEvent } from "@/lib/ws-events";
import { useAuth } from "@/modules/auth";
import { QueryKeys } from "@/constants/query-keys";

const TOAST_POSITION = "top-center" as const;

export function useSubscribeUserNotifications(): void {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const queryClient = useQueryClient();

  const wsUrl = envConfig.wsUrl;
  const topic = user != null ? notificationsUserTopic(user.id) : "";

  useSubscribe(wsUrl, topic, {
    enabled: !!user && !!wsUrl,
    onMessage(data) {
      if (isProjectDeletedEvent(data)) {
        const deletedId = data.projectId;
        queryClient.removeQueries({ queryKey: QueryKeys.projectDetail(Number(deletedId)) });
        queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });

        toast.error("Project deleted", {
          position: TOAST_POSITION,
          closeButton: true,
          description: "A project you had access to has been deleted.",
        });

        if (routeProjectId != null && String(routeProjectId) === deletedId) {
          navigate("/dashboard/projects", { replace: true });
        }
        return;
      }

      if (isRuntimeCreatedEvent(data)) {
        toast.success("Runtime ready", {
          position: TOAST_POSITION,
          closeButton: true,
          description: `A new runtime is available.`,
        });
      }
    },
  });
}
