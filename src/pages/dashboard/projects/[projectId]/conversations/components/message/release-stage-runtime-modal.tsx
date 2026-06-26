"use client";

import { postReleaseControllerStageRelease } from "@/modules/project/api";
import { invalidateQueriesAfterRuntimeDeploy } from "@/modules/project/invalidate-project-queries";
import { PlatformEnvironmentType } from "@/modules/project/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { emitStageDeployOnRuntimeDone } from "@/services/events";
import { StageRuntimePickerModal, useStageRuntimeDetachMutation } from "./stage-runtime-modal-shared";

export function ReleaseStageRuntimeModal({
    open,
    onOpenChange,
    projectId,
    chatSessionId,
    messageId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | undefined;
    chatSessionId: string | undefined;
    messageId: string;
}) {
    const queryClient = useQueryClient();
    const detachMutation = useStageRuntimeDetachMutation(projectId);

    const stageReleaseMutation = useMutation({
        mutationFn: (runtimeId: string) =>
            postReleaseControllerStageRelease(projectId!, chatSessionId!, messageId, {
                stage_project_runtime_id: runtimeId,
            }),
        onSuccess: async () => {
            await invalidateQueriesAfterRuntimeDeploy(queryClient, projectId!, PlatformEnvironmentType.stage);
            emitStageDeployOnRuntimeDone();
            onOpenChange(false);
            toast.success("Deploying has started.");
        },
        onError: () => {
            toast.error("Could not start stage deploy.");
        },
    });

    const swapConnectTarget =
        chatSessionId != null
            ? ({
                  mode: "release_from_controller" as const,
                  chatSessionId,
                  releaseControllerMessageId: messageId,
              })
            : undefined;

    return (
        <StageRuntimePickerModal
            open={open}
            onOpenChange={onOpenChange}
            projectId={projectId}
            title="Release to stage"
            description="Choose a stage runtime to deploy this release scope. If a runtime already has another release live, you can swap it to this scope instead (detach, then connect the stage release from this message)."
            swapConnectTarget={swapConnectTarget}
            onDeploy={(r) => {
                if (projectId == null || chatSessionId == null) return;
                stageReleaseMutation.mutate(r.id);
            }}
            onSwapLiveRelease={(runtimeId) =>
                detachMutation.mutate(
                    {
                        runtimeId,
                        body: {
                            chat_session_id: chatSessionId!,
                            release_controller_message_id: messageId,
                        },
                    },
                    { onSuccess: () => {
                        emitStageDeployOnRuntimeDone();
                        onOpenChange(false);
                    } },
                )
            }
            deployingRuntimeId={stageReleaseMutation.isPending ? stageReleaseMutation.variables ?? null : null}
            swappingRuntimeId={detachMutation.isPending ? detachMutation.variables?.runtimeId ?? null : null}
        />
    );
}
