import { QueryKeys } from "@/constants/query-keys";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { isProductionLiveReleaseChangedEvent, isProjectDeletedEvent, isRuntimeCreatedEvent, userTopic } from "@/lib/ws-events";
import { useAuth } from "@/modules/auth";
import { handleChatSessionWsEvent, handleProjectUnitWsEvent } from "@/modules/project-chat/ws-cache-handler";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useRef } from "react";
import { toast } from "sonner";

const TOAST_POSITION = "top-center" as const;

export function useSubscribeUserNotifications(): void {
    const { user } = useAuth();
    const { projectId: routeProjectId, conversationId: routeConversationId } = useParams<{
        projectId?: string;
        conversationId?: string;
    }>();
    const queryClient = useQueryClient();
    const chunkTracking = useRef({
        messageChunks: new Map<string, number>(),
        thinkingChunks: new Map<string, number>(),
    });

    const wsUrl = envConfig.wsUrl;
    const topic = user != null ? userTopic(user.id) : "";

    useSubscribe(wsUrl, topic, {
        enabled: !!user && !!wsUrl,
        onMessage(data) {
            if (handleChatSessionWsEvent(data, queryClient, chunkTracking.current)) {
                return;
            }
            if (handleProjectUnitWsEvent(data, queryClient)) {
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

            if (isProductionLiveReleaseChangedEvent(data)) {
                queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(data.project_id) });
                if (
                    routeProjectId != null &&
                    routeConversationId != null &&
                    data.project_id === routeProjectId
                ) {
                    queryClient.invalidateQueries({
                        queryKey: QueryKeys.projectChatSessionDetail(data.project_id, routeConversationId),
                    });
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
