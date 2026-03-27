"use client";

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
import { detachRuntimeLiveRelease, postReleaseControllerStageRelease } from "@/modules/project/api";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType, type ProjectRuntimeResponse } from "@/modules/project/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Rocket, Unlink } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function RuntimeRow({
    runtime,
    onDeploy,
    onDetach,
    isDeploying,
    isDetaching,
}: {
    runtime: ProjectRuntimeResponse;
    onDeploy: () => void;
    onDetach: () => void;
    isDeploying: boolean;
    isDetaching: boolean;
}) {
    const busy = runtime.live_release_revision != null;

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
                            Currently live on reversion {runtime.live_release_revision}
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    variant={busy ? "destructive" : "outline"}
                    size="xs"
                    className="shrink-0"
                    disabled={isDeploying || isDetaching}
                    onClick={busy ? onDetach : onDeploy}
                >
                    {isDeploying || isDetaching ? (
                        <>
                            <Spinner className="size-3" />
                            {busy ? "Detaching…" : "Deploying…"}
                        </>
                    ) : busy ? (
                        <>
                            <Unlink className="size-3" aria-hidden />
                            Detach
                        </>
                    ) : (
                        <>
                            <Rocket className="size-3" aria-hidden />
                            Deploy
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

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
    const {
        data: runtimes,
        isLoading,
        error,
    } = useProjectRuntimesQuery(projectId, { enabled: !!projectId && open });

    const [runtimeToDetach, setRuntimeToDetach] = useState<ProjectRuntimeResponse | null>(null);

    const stageRuntimes = useMemo(() => {
        const list = runtimes ?? [];
        return list.filter((r) => r.environment === PlatformEnvironmentType.stage);
    }, [runtimes]);

    const { idleRuntimes, busyRuntimes } = useMemo(() => {
        const idle = stageRuntimes.filter((r) => r.live_release_revision == null);
        const busy = stageRuntimes.filter((r) => r.live_release_revision != null);
        return { idleRuntimes: idle, busyRuntimes: busy };
    }, [stageRuntimes]);

    const detachMutation = useMutation({
        mutationFn: (runtimeId: string) => detachRuntimeLiveRelease(projectId!, runtimeId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId!) });
            toast.success("Runtime detached from its stage release.", { position: "top-center" });
            setRuntimeToDetach(null);
        },
        onError: () => {
            toast.error("Could not detach runtime from live release.", { position: "top-center" });
        },
    });

    const stageReleaseMutation = useMutation({
        mutationFn: (runtimeId: string) =>
            postReleaseControllerStageRelease(projectId!, chatSessionId!, messageId, {
                stage_project_runtime_id: runtimeId,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QueryKeys.projectRuntimes(projectId!) });
            onOpenChange(false);
            toast.success("Deploying has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start stage deploy.", { position: "top-center" });
        },
    });

    const handleDeploy = (runtime: ProjectRuntimeResponse) => {
        if (projectId == null || chatSessionId == null) return;
        stageReleaseMutation.mutate(runtime.id);
    };

    const detachConfirmOpen = runtimeToDetach != null;

    return (
        <>
            <CentricModal open={open} onOpenChange={onOpenChange}>
                <CentricModalContent className="sm:max-w-md">
                    <CentricModalHeader>
                        <CentricModalTitle>Release to stage</CentricModalTitle>
                        <CentricModalDescription>
                            Choose a stage runtime to deploy this release scope.
                        </CentricModalDescription>
                    </CentricModalHeader>

                    <div className="space-y-4">
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Spinner className="size-4" />
                                Loading runtimes…
                            </div>
                        )}
                        {error != null && (
                            <p className="text-sm text-destructive">Failed to load runtimes. Try again.</p>
                        )}
                        {!isLoading && error == null && stageRuntimes.length === 0 && (
                            <p className="text-sm text-muted-foreground">No stage runtimes available.</p>
                        )}
                        {!isLoading && error == null && stageRuntimes.length > 0 && (
                            <>
                                {idleRuntimes.length > 0 && (
                                    <div className="space-y-2">
                                        <SectionTitle className="mb-2 flex items-center gap-2">
                                            Idle runtimes
                                        </SectionTitle>
                                        <div className="space-y-2">
                                            {idleRuntimes.map((r) => (
                                                <RuntimeRow
                                                    key={r.id}
                                                    runtime={r}
                                                    onDeploy={() => handleDeploy(r)}
                                                    onDetach={() => setRuntimeToDetach(r)}
                                                    isDeploying={stageReleaseMutation.isPending && stageReleaseMutation.variables === r.id}
                                                    isDetaching={detachMutation.isPending && detachMutation.variables === r.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {busyRuntimes.length > 0 && (
                                    <div className="space-y-2">
                                        <SectionTitle className="mb-2 flex items-center gap-2">
                                            Busy runtimes
                                        </SectionTitle>
                                        <div className="space-y-2">
                                            {busyRuntimes.map((r) => (
                                                <RuntimeRow
                                                    key={r.id}
                                                    runtime={r}
                                                    onDeploy={() => handleDeploy(r)}
                                                    onDetach={() => setRuntimeToDetach(r)}
                                                    isDeploying={stageReleaseMutation.isPending && stageReleaseMutation.variables === r.id}
                                                    isDetaching={detachMutation.isPending && detachMutation.variables === r.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CentricModalContent>
            </CentricModal>

            <AlertDialog
                open={detachConfirmOpen}
                onOpenChange={(next) => {
                    if (!next) setRuntimeToDetach(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Detach live release?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {runtimeToDetach != null && (
                                <>
                                    This will detach runtime <strong>{runtimeToDetach.name}</strong> from its current stage live release
                                    {runtimeToDetach.live_release_revision != null ? (
                                        <>
                                            {" "}
                                            (revision {runtimeToDetach.live_release_revision})
                                        </>
                                    ) : null}
                                    . You can deploy a new release afterward.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={detachMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (runtimeToDetach == null || projectId == null) return;
                                detachMutation.mutate(runtimeToDetach.id);
                            }}
                            disabled={detachMutation.isPending}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {detachMutation.isPending ? (
                                "Detaching…"
                            ) : (
                                <>
                                    <Unlink className="size-4" aria-hidden />
                                    Detach
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
