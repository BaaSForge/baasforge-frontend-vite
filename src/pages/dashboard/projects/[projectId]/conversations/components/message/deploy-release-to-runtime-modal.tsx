"use client";

import { StageRuntimePickerModal, useStageRuntimeDetachMutation } from "./stage-runtime-modal-shared";
import { emitStageDeployOnRuntimeDone } from "@/services/events";

export function DeployReleaseToRuntimeModal({
    open,
    onOpenChange,
    projectId,
    releaseId,
    chatSessionIdForDetach,
    revision,
    revisionLabel,
    onDeployRuntime,
    deployingRuntimeId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | undefined;
    /** Release row id — confirmation UI only (revision can repeat across chat sessions). */
    releaseId: string;
    /** Owning chat session for detach-live-release / ByRevision (API does not accept release_id). */
    chatSessionIdForDetach: string;
    /** Deploy body + display (revision can duplicate across chat sessions). */
    revision: string;
    revisionLabel: string;
    onDeployRuntime: (runtimeId: string) => void;
    deployingRuntimeId: string | null;
}) {
    const detachMutation = useStageRuntimeDetachMutation(projectId);

    return (
        <StageRuntimePickerModal
            open={open}
            onOpenChange={onOpenChange}
            projectId={projectId}
            title="Choose a stage runtime to deploy"
            description={
                <>
                    Deploy release revision <strong>{revisionLabel}</strong> to the runtime you select. On a runtime that
                    already has a live release, you can swap it to this revision instead (detach, then connect that
                    revision).
                </>
            }
            swapConnectTarget={{ mode: "deploy_revision", revision, releaseId }}
            onDeploy={(r) => onDeployRuntime(r.id)}
            onSwapLiveRelease={(runtimeId) =>
                detachMutation.mutate(
                    {
                        runtimeId,
                        body: { revision, chat_session_id: chatSessionIdForDetach },
                    },
                    { onSuccess: () => {
                        emitStageDeployOnRuntimeDone();
                        onOpenChange(false);
                    } },
                )
            }
            deployingRuntimeId={deployingRuntimeId}
            swappingRuntimeId={detachMutation.isPending ? detachMutation.variables?.runtimeId ?? null : null}
        />
    );
}
