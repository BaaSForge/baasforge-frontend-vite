import { QueryKeys } from "@/constants/query-keys";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { isProjectDeletedEvent, isRuntimeCreatedEvent, userTopic } from "@/lib/ws-events";
import { useAuth } from "@/modules/auth";
import { handleChatSessionWsEvent } from "@/modules/project-chat/ws-cache-handler";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useRef } from "react";
import { toast } from "sonner";

const TOAST_POSITION = "top-center" as const;

export function useSubscribeUserNotifications(): void {
    const { user } = useAuth();
    const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
    const queryClient = useQueryClient();
    const lastAppliedChunkByMessageRef = useRef(new Map<string, number>());

    const wsUrl = envConfig.wsUrl;
    const topic = user != null ? userTopic(user.id) : "";

    useSubscribe(wsUrl, topic, {
        enabled: !!user && !!wsUrl,
        onMessage(data) {
            if (handleChatSessionWsEvent(data, queryClient, lastAppliedChunkByMessageRef)) {
                return;
            }
            if (isProjectDeletedEvent(data)) {
                toast.error("Project has been deleted", {
                    position: TOAST_POSITION,
                    closeButton: true,
                    description: "A project you had access to has been deleted.",
                });

                const deletedId = data.project_id;

                if (String(routeProjectId) !== deletedId) {
                    queryClient.removeQueries({ queryKey: QueryKeys.projectDetail(deletedId) });
                    queryClient.invalidateQueries({ queryKey: QueryKeys.PROJECTS_LIST });
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
