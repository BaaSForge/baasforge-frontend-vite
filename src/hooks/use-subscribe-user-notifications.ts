import { QueryKeys } from "@/constants/query-keys";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { isProductionLiveReleaseChangedEvent, isProjectDeletedEvent, isRuntimeCreatedEvent, userTopic } from "@/lib/ws-events";
import { useAuth } from "@/modules/auth";
import { getProjectRuntimes } from "@/modules/project/api";
import { invalidateQueriesAfterRuntimeDeploy } from "@/modules/project/invalidate-project-queries";
import { getLiveProductionReleaseOwnerChatSessionId } from "@/modules/project/runtime-release";
import { PlatformEnvironmentType } from "@/modules/project/types";
import { getProjectChatSessionDetail } from "@/modules/project-chat/api";
import { handleChatSessionWsEvent, handleProjectUnitWsEvent } from "@/modules/project-chat/ws-cache-handler";
import { STALE_BASE_RELEASE_CONVERSATION_MESSAGE } from "@/modules/project-chat/stale-base-release-conversation-message";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useRef } from "react";
import { toast } from "@/lib/toast";

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
                const projectId = data.project_id;
                void (async () => {
                    await invalidateQueriesAfterRuntimeDeploy(
                        queryClient,
                        projectId,
                        PlatformEnvironmentType.prod,
                    );
                    if (
                        routeProjectId == null ||
                        routeConversationId == null ||
                        projectId !== routeProjectId
                    ) {
                        return;
                    }
                    const conversationId = routeConversationId;
                    const [session, runtimes] = await Promise.all([
                        queryClient.fetchQuery({
                            queryKey: QueryKeys.projectChatSessionDetail(projectId, conversationId),
                            queryFn: () => getProjectChatSessionDetail(projectId, conversationId),
                        }),
                        queryClient.fetchQuery({
                            queryKey: QueryKeys.projectRuntimes(projectId),
                            queryFn: () => getProjectRuntimes(projectId),
                        }),
                    ]);
                    if (session?.stale_base_release !== true) return;
                    if (getLiveProductionReleaseOwnerChatSessionId(runtimes) === conversationId) return;
                    toast.warning("Production changed — this chat's base is stale", {
                        description: STALE_BASE_RELEASE_CONVERSATION_MESSAGE,
                    });
                })();
                return;
            }

            if (isRuntimeCreatedEvent(data)) {
                toast.success("Runtime ready", {
                    description: `A new runtime is available.`,
                });
            }
        },
    });
}
