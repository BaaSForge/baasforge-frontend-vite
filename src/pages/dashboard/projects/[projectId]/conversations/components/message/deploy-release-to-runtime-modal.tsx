"use client";

import { StageRuntimePickerModal, useStageRuntimeDetachMutation } from "./stage-runtime-modal-shared";

export function DeployReleaseToRuntimeModal({
    open,
    onOpenChange,
    projectId,
    revision,
    revisionLabel,
    onDeployRuntime,
    deployingRuntimeId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | undefined;
    /** Existing stage release revision to deploy or to connect after detach. */
    revision: number;
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
            swapConnectTarget={{ mode: "deploy_revision", revision }}
            onDeploy={(r) => onDeployRuntime(r.id)}
            onSwapLiveRelease={(runtimeId) =>
                detachMutation.mutate(
                    { runtimeId, body: { revision } },
                    { onSuccess: () => onOpenChange(false) },
                )
            }
            deployingRuntimeId={deployingRuntimeId}
            swappingRuntimeId={detachMutation.isPending ? detachMutation.variables?.runtimeId ?? null : null}
        />
    );
}
