import type { ReleaseControllerActions } from "./use-release-controller-actions";

export function prodReleaseDisabledTooltip(reason: "stage-first" | "rejected" | "missing-context"): string {
    if (reason === "stage-first") return "Release to stage first.";
    if (reason === "missing-context") return "Missing project or conversation context.";
    return "New releases are disabled for this scope because the step was rejected.";
}

export type StageReleaseRowView =
    | { kind: "live-badge" }
    | { kind: "none" }
    | { kind: "no-runtimes"; revision: number }
    | { kind: "deploy"; revision: number; disabled: boolean; pending: boolean }
    | { kind: "disabled-release"; reason: "missing-context" | "rejected" }
    | { kind: "open-stage-modal" };

export function stageReleaseRowView(actions: ReleaseControllerActions, projectId: string | undefined): StageReleaseRowView {
    const {
        stageRelease,
        disabledDueToReject,
        stageRuntimes,
        isStageReleaseLiveOnRuntime,
        stageRevisionNum,
        stageRedeployMutation,
        canOpenStageReleaseModal,
    } = actions;

    if (stageRelease != null) {
        if (isStageReleaseLiveOnRuntime) return { kind: "live-badge" };
        if (projectId == null || stageRevisionNum == null) return { kind: "none" };
        if (stageRuntimes.length === 0) return { kind: "no-runtimes", revision: stageRelease.revision };
        return {
            kind: "deploy",
            revision: stageRelease.revision,
            disabled: stageRedeployMutation.isPending || disabledDueToReject,
            pending: stageRedeployMutation.isPending,
        };
    }
    if (!canOpenStageReleaseModal) return { kind: "disabled-release", reason: "missing-context" };
    if (disabledDueToReject) return { kind: "disabled-release", reason: "rejected" };
    return { kind: "open-stage-modal" };
}

export type ProdReleaseRowView =
    | { kind: "live-badge" }
    | { kind: "none" }
    | { kind: "no-runtimes"; revision: number }
    | { kind: "deploy"; revision: number; disabled: boolean; pending: boolean }
    | { kind: "disabled-release"; reason: "stage-first" | "rejected" | "missing-context" }
    | { kind: "open-production-confirm"; pending: boolean };

export function prodReleaseRowView(actions: ReleaseControllerActions, projectId: string | undefined): ProdReleaseRowView {
    const {
        stageRelease,
        prodRelease,
        disabledDueToReject,
        prodRuntimes,
        isProdReleaseLiveOnRuntime,
        prodRevisionNum,
        prodRedeployMutation,
        productionReleaseMutation,
        canCallProductionRelease,
    } = actions;

    if (prodRelease != null) {
        if (isProdReleaseLiveOnRuntime) return { kind: "live-badge" };
        if (projectId == null || prodRevisionNum == null) return { kind: "none" };
        if (prodRuntimes.length === 0) return { kind: "no-runtimes", revision: prodRelease.revision };
        return {
            kind: "deploy",
            revision: prodRelease.revision,
            disabled: prodRedeployMutation.isPending || disabledDueToReject,
            pending: prodRedeployMutation.isPending,
        };
    }
    if (stageRelease == null) return { kind: "disabled-release", reason: "stage-first" };
    if (disabledDueToReject) return { kind: "disabled-release", reason: "rejected" };
    if (!canCallProductionRelease) return { kind: "disabled-release", reason: "missing-context" };
    return { kind: "open-production-confirm", pending: productionReleaseMutation.isPending };
}
