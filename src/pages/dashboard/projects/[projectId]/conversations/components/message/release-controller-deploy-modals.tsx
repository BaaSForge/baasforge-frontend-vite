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
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import {
    STALE_BASE_RELEASE_CONVERSATION_MESSAGE,
    useConversationStaleBaseRelease,
} from "../conversation-stale-base-release-context";
import { DeployReleaseToRuntimeModal } from "./deploy-release-to-runtime-modal";
import type { ReleaseControllerActions } from "./use-release-controller-actions";
import { ReleaseStageRuntimeModal } from "./release-stage-runtime-modal";

export function ReleaseControllerDeployModals({
    message,
    projectId,
    chatSessionId,
    actions,
}: {
    message: ChatMessageWithDeliveryStatus;
    projectId: string | undefined;
    chatSessionId: string | undefined;
    actions: ReleaseControllerActions;
}) {
    const staleBaseRelease = useConversationStaleBaseRelease();
    const {
        stageRelease,
        prodRelease,
        stageRevision,
        stageReleaseId,
        stageRedeployMutation,
        prodRedeployMutation,
        productionReleaseMutation,
        stageReleaseModalOpen,
        setStageReleaseModalOpen,
        productionConfirmOpen,
        setProductionConfirmOpen,
        stageDeployRuntimePickOpen,
        setStageDeployRuntimePickOpen,
        productionRedeployConfirmOpen,
        setProductionRedeployConfirmOpen,
        prodRedeployRuntimeId,
        setProdRedeployRuntimeId,
    } = actions;

    return (
        <>
            <AlertDialog open={productionConfirmOpen} onOpenChange={setProductionConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>I have tested, let&apos;s deploy</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    This starts a production release for the scope up to this message. Confirm only when you have
                                    tested on stage and are ready for these changes to go live.
                                </p>
                                {staleBaseRelease ? (
                                    <p className="text-amber-900 dark:text-amber-100/95">
                                        {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
                                    </p>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={productionReleaseMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                productionReleaseMutation.mutate();
                            }}
                            disabled={productionReleaseMutation.isPending}
                        >
                            {productionReleaseMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Releasing…
                                </>
                            ) : (
                                "Deploy to production"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={productionRedeployConfirmOpen}
                onOpenChange={(open) => {
                    setProductionRedeployConfirmOpen(open);
                    if (!open) setProdRedeployRuntimeId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Deploy revision {prodRelease?.revision ?? ""} to production?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    This deploys release revision {prodRelease?.revision ?? ""} to the production runtime. Confirm
                                    only when you have tested on stage and are ready for these changes to go live.
                                </p>
                                {staleBaseRelease ? (
                                    <p className="text-amber-900 dark:text-amber-100/95">
                                        {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
                                    </p>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={prodRedeployMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                if (prodRedeployRuntimeId == null) return;
                                prodRedeployMutation.mutate(prodRedeployRuntimeId);
                            }}
                            disabled={prodRedeployMutation.isPending || prodRedeployRuntimeId == null}
                        >
                            {prodRedeployMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Deploying…
                                </>
                            ) : (
                                <>Deploy revision {prodRelease?.revision ?? ""}</>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {stageRevision != null && stageRevision !== "" && stageReleaseId != null && chatSessionId != null && (
                <DeployReleaseToRuntimeModal
                    open={stageDeployRuntimePickOpen}
                    onOpenChange={setStageDeployRuntimePickOpen}
                    projectId={projectId}
                    releaseId={stageReleaseId}
                    chatSessionIdForDetach={stageRelease?.chat_session_id ?? chatSessionId}
                    revision={stageRevision}
                    revisionLabel={stageRelease != null ? String(stageRelease.revision) : ""}
                    onDeployRuntime={(runtimeId) => stageRedeployMutation.mutate(runtimeId)}
                    deployingRuntimeId={stageRedeployMutation.isPending ? stageRedeployMutation.variables ?? null : null}
                />
            )}

            <ReleaseStageRuntimeModal
                open={stageReleaseModalOpen}
                onOpenChange={setStageReleaseModalOpen}
                projectId={projectId}
                chatSessionId={chatSessionId}
                messageId={message.id}
            />
        </>
    );
}
