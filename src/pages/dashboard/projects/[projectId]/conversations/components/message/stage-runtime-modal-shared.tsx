"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { SectionTitle } from "@/components/section-title";
import { Spinner } from "@/components/ui/spinner";
import { QueryKeys } from "@/constants/query-keys";
import {
    detachRuntimeLiveRelease,
    type DetachRuntimeLiveReleaseBody,
} from "@/modules/project/api";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { PlatformEnvironmentType } from "@/modules/project/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, FlaskConical, Rocket } from "lucide-react";
import { toast } from "sonner";

export type StageRuntimeSwapMutationVariables = { runtimeId: string; body: DetachRuntimeLiveReleaseBody };

export function useStageRuntimeDetachMutation(projectId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ runtimeId, body }: StageRuntimeSwapMutationVariables) =>
            detachRuntimeLiveRelease(projectId!, runtimeId, body),
        onSuccess: async () => {
            if (projectId == null) return;
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId) });
            await queryClient.invalidateQueries({
                queryKey: QueryKeys.projectReleases(projectId, PlatformEnvironmentType.stage),
            });
            toast.success("Stage runtime live release was updated.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not swap the stage live release.", { position: "top-center" });
        },
    });
}

export function filterStageRuntimes(runtimes: ProjectRuntimeResponse[] | undefined): ProjectRuntimeResponse[] {
    const list = runtimes ?? [];
    return list.filter((r) => r.environment === PlatformEnvironmentType.stage);
}

export function StageRuntimesPickerStatus({
    isLoading,
    error,
    stageRuntimes,
    children,
}: {
    isLoading: boolean;
    error: unknown;
    stageRuntimes: ProjectRuntimeResponse[];
    children: ReactNode;
}) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Loading runtimes…
            </div>
        );
    }
    if (error != null) {
        return <p className="text-sm text-destructive">Failed to load runtimes. Try again.</p>;
    }
    if (stageRuntimes.length === 0) {
        return <p className="text-sm text-muted-foreground">No stage runtimes available.</p>;
    }
    return <>{children}</>;
}

function StageRuntimeRow({
    runtime,
    onDeploy,
    onSwapLiveRelease,
    isDeploying,
    isSwapping,
    swapDisabled,
    swapDisabledReason,
}: {
    runtime: ProjectRuntimeResponse;
    onDeploy: () => void;
    onSwapLiveRelease: () => void;
    isDeploying: boolean;
    isSwapping: boolean;
    swapDisabled?: boolean;
    swapDisabledReason?: string;
}) {
    const busy = runtime.live_release != null;
    const liveRevision = runtime.live_release?.revision ?? null;
    const swapBlocked = Boolean(busy && swapDisabled);

    const swapButton = (
        <Button
            type="button"
            variant={busy ? "destructive" : "outline"}
            size="xs"
            className="shrink-0"
            disabled={isDeploying || isSwapping || swapBlocked}
            onClick={busy ? onSwapLiveRelease : onDeploy}
        >
            {isDeploying || isSwapping ? (
                <>
                    <Spinner className="size-3" />
                    {busy ? "Swapping…" : "Deploying…"}
                </>
            ) : busy ? (
                <>
                    <ArrowLeftRight className="size-3" aria-hidden />
                    Swap release
                </>
            ) : (
                <>
                    <Rocket className="size-3" aria-hidden />
                    Deploy
                </>
            )}
        </Button>
    );

    return (
        <div className="flex flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <FlaskConical className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{runtime.name}</p>
                    </div>
                    {busy && (
                        <p className="text-xs text-amber-700 dark:text-amber-500/90">
                            {liveRevision != null
                                ? `Currently live on revision ${liveRevision}`
                                : "A release is currently live on this runtime"}
                        </p>
                    )}
                </div>
                {swapBlocked && swapDisabledReason != null ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-flex">{swapButton}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top">{swapDisabledReason}</TooltipContent>
                    </Tooltip>
                ) : (
                    swapButton
                )}
            </div>
        </div>
    );
}

/** What we connect after detach — drives confirmation copy; parent maps this to `DetachRuntimeLiveReleaseBody`. */
export type StageRuntimeSwapConnectTarget =
    | { mode: "deploy_revision"; revision: number; releaseId: string }
    | { mode: "release_from_controller"; chatSessionId: string; releaseControllerMessageId: string };

export type StageRuntimePickerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | undefined;
    title: ReactNode;
    description: ReactNode;
    idleSectionTitle?: string;
    busySectionTitle?: string;
    /** Required to enable swap on busy runtimes and to label the confirmation dialog. */
    swapConnectTarget: StageRuntimeSwapConnectTarget | undefined;
    onDeploy: (runtime: ProjectRuntimeResponse) => void;
    /** Called after confirm; parent sends `DetachRuntimeLiveReleaseBody` for this flow. */
    onSwapLiveRelease: (runtimeId: string) => void;
    deployingRuntimeId: string | null;
    swappingRuntimeId: string | null;
};

/**
 * Stage runtime picker: idle / busy sections, deploy vs swap live release, shared confirmation.
 * Callers differ only in copy and what `onDeploy` / `onSwapLiveRelease` do (API).
 */
export function StageRuntimePickerModal({
    open,
    onOpenChange,
    projectId,
    title,
    description,
    idleSectionTitle = "Idle runtimes",
    busySectionTitle = "Runtimes with another live release",
    swapConnectTarget,
    onDeploy,
    onSwapLiveRelease,
    deployingRuntimeId,
    swappingRuntimeId,
}: StageRuntimePickerModalProps) {
    const {
        data: runtimes,
        isLoading,
        error,
    } = useProjectRuntimesQuery(projectId, { enabled: !!projectId && open });

    const [runtimeToDetach, setRuntimeToDetach] = useState<ProjectRuntimeResponse | null>(null);

    const stageRuntimes = useMemo(() => filterStageRuntimes(runtimes), [runtimes]);

    const { idleRuntimes, busyRuntimes } = useMemo(() => {
        const idle = stageRuntimes.filter((r) => r.live_release == null);
        const busy = stageRuntimes.filter((r) => r.live_release != null);
        return { idleRuntimes: idle, busyRuntimes: busy };
    }, [stageRuntimes]);

    const prevSwapping = useRef<string | null>(null);
    useEffect(() => {
        if (prevSwapping.current != null && swappingRuntimeId == null && runtimeToDetach != null) {
            queueMicrotask(() => {
                setRuntimeToDetach(null);
            });
        }
        prevSwapping.current = swappingRuntimeId;
    }, [swappingRuntimeId, runtimeToDetach]);

    const swapConfirmOpen = runtimeToDetach != null;
    const swapDisabledOnBusy = swapConnectTarget == null;
    const runtimeToDetachLiveRevision = runtimeToDetach?.live_release?.revision ?? null;

    return (
        <>
            <CentricModal open={open} onOpenChange={onOpenChange}>
                <CentricModalContent className="sm:max-w-md">
                    <CentricModalHeader>
                        <CentricModalTitle>{title}</CentricModalTitle>
                        <CentricModalDescription>{description}</CentricModalDescription>
                    </CentricModalHeader>

                    <div className="space-y-4">
                        <StageRuntimesPickerStatus isLoading={isLoading} error={error} stageRuntimes={stageRuntimes}>
                            <>
                                {idleRuntimes.length > 0 && (
                                    <div className="space-y-2">
                                        <SectionTitle className="mb-2 flex items-center gap-2">{idleSectionTitle}</SectionTitle>
                                        <div className="space-y-2">
                                            {idleRuntimes.map((r) => (
                                                <StageRuntimeRow
                                                    key={r.id}
                                                    runtime={r}
                                                    onDeploy={() => onDeploy(r)}
                                                    onSwapLiveRelease={() => setRuntimeToDetach(r)}
                                                    isDeploying={deployingRuntimeId === r.id}
                                                    isSwapping={swappingRuntimeId === r.id}
                                                    swapDisabled={swapDisabledOnBusy}
                                                    swapDisabledReason={
                                                        swapDisabledOnBusy
                                                            ? "Loading swap target…"
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {busyRuntimes.length > 0 && (
                                    <div className="space-y-2">
                                        <SectionTitle className="mb-2 flex items-center gap-2">{busySectionTitle}</SectionTitle>
                                        <div className="space-y-2">
                                            {busyRuntimes.map((r) => (
                                                <StageRuntimeRow
                                                    key={r.id}
                                                    runtime={r}
                                                    onDeploy={() => onDeploy(r)}
                                                    onSwapLiveRelease={() => setRuntimeToDetach(r)}
                                                    isDeploying={deployingRuntimeId === r.id}
                                                    isSwapping={swappingRuntimeId === r.id}
                                                    swapDisabled={swapDisabledOnBusy}
                                                    swapDisabledReason={
                                                        swapDisabledOnBusy
                                                            ? "Loading swap target…"
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        </StageRuntimesPickerStatus>
                    </div>
                </CentricModalContent>
            </CentricModal>

            <AlertDialog
                open={swapConfirmOpen}
                onOpenChange={(next) => {
                    if (!next) setRuntimeToDetach(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Swap stage live release?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {runtimeToDetach != null && swapConnectTarget?.mode === "deploy_revision" && (
                                <>
                                    This will remove the current live release from runtime{" "}
                                    <strong>{runtimeToDetach.name}</strong>
                                    {runtimeToDetachLiveRevision != null ? (
                                        <> (revision {runtimeToDetachLiveRevision} is live)</>
                                    ) : null}{" "}
                                    and connect the selected stage release (revision{" "}
                                    <strong>{swapConnectTarget.revision}</strong>
                                    {", id "}
                                    <span className="font-mono text-xs">
                                        {swapConnectTarget.releaseId.slice(0, 8)}…
                                    </span>
                                    ) to that runtime instead.
                                </>
                            )}
                            {runtimeToDetach != null && swapConnectTarget?.mode === "release_from_controller" && (
                                <>
                                    This will remove the current live release from runtime{" "}
                                    <strong>{runtimeToDetach.name}</strong>
                                    {runtimeToDetachLiveRevision != null ? (
                                        <> (revision {runtimeToDetachLiveRevision} is live)</>
                                    ) : null}{" "}
                                    and connect the stage release for <strong>this scope</strong> (release up to this
                                    message) to that runtime instead.
                                </>
                            )}
                            {runtimeToDetach != null && swapConnectTarget == null && <>Loading swap target…</>}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={swappingRuntimeId != null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (runtimeToDetach == null || swapConnectTarget == null) return;
                                onSwapLiveRelease(runtimeToDetach.id);
                            }}
                            disabled={swappingRuntimeId != null || swapConnectTarget == null}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {swappingRuntimeId != null ? (
                                "Swapping…"
                            ) : (
                                <>
                                    <ArrowLeftRight className="size-4" aria-hidden />
                                    Swap release
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
