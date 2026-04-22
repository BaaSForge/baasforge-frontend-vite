"use client";

import { SecondarySidebarStickyFooter } from "@/components/secondary-sidebar/secondary-sidebar-content";
import { useLastNotDisabledReleaseControllerMessageQuery } from "@/modules/project";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { ReleaseControllerDeployModals } from "./components/message/release-controller-deploy-modals";
import { useReleaseControllerActions } from "./components/message/use-release-controller-actions";
import { SecondarySidebarReleaseProdRow } from "./secondary-sidebar-release-prod-row";
import { SecondarySidebarReleaseStageRow } from "./secondary-sidebar-release-stage-row";

function SecondarySidebarReleaseControllerBody({
    message,
    projectId,
    chatSessionId,
}: {
    message: ChatMessageWithDeliveryStatus;
    projectId: string;
    chatSessionId: string;
}) {
    const actions = useReleaseControllerActions(message, projectId, chatSessionId);
    return (
        <>
            <SecondarySidebarStickyFooter>
                <div className="flex w-full min-w-0 flex-col gap-2">
                    <SecondarySidebarReleaseStageRow actions={actions} projectId={projectId} />
                    <SecondarySidebarReleaseProdRow actions={actions} projectId={projectId} />
                </div>
            </SecondarySidebarStickyFooter>
            <ReleaseControllerDeployModals
                message={message}
                projectId={projectId}
                chatSessionId={chatSessionId}
                actions={actions}
            />
        </>
    );
}

export function SecondarySidebarReleaseControllerFooter({
    projectId,
    chatSessionId,
}: {
    projectId: string;
    chatSessionId: string;
}) {
    const { data: message, isPending, isError, refetch } = useLastNotDisabledReleaseControllerMessageQuery(
        projectId,
        chatSessionId,
    );

    if (isPending) {
        return null;
    }

    if (isError) {
        return (
            <SecondarySidebarStickyFooter>
                <button
                    type="button"
                    className="w-full text-center text-xs text-destructive underline-offset-2 hover:underline"
                    onClick={() => void refetch()}
                >
                    Could not load release actions. Tap to retry.
                </button>
            </SecondarySidebarStickyFooter>
        );
    }

    if (message == null) {
        return null;
    }

    return (
        <SecondarySidebarReleaseControllerBody
            message={message}
            projectId={projectId}
            chatSessionId={chatSessionId}
        />
    );
}
