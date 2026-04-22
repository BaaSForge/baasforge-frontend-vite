"use client";

import {
    detachRuntimeLiveRelease,
    postReleaseControllerProductionRelease,
    postRuntimeDeployProductionRelease,
    postRuntimeDeployStageRelease,
} from "@/modules/project/api";
import { invalidateQueriesAfterRuntimeDeploy } from "@/modules/project/invalidate-project-queries";
import { PlatformEnvironmentType } from "@/modules/project/types";
import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getReleaseControllerPayload, useReleaseControllerRuntimeLiveFlags } from "./release-controller-box-shared";

export function useReleaseControllerActions(
    message: ChatMessageWithDeliveryStatus,
    projectId: string | undefined,
    chatSessionId: string | undefined,
) {
    const {
        stage_release: stageRelease,
        prod_release: prodRelease,
        is_disabled_due_to_reject: isDisabledDueToRejectRaw,
    } = getReleaseControllerPayload(message);
    const disabledDueToReject = isDisabledDueToRejectRaw === true;

    const [stageReleaseModalOpen, setStageReleaseModalOpen] = useState(false);
    const [productionConfirmOpen, setProductionConfirmOpen] = useState(false);
    const [stageDeployRuntimePickOpen, setStageDeployRuntimePickOpen] = useState(false);
    const [productionRedeployConfirmOpen, setProductionRedeployConfirmOpen] = useState(false);
    const [prodRedeployRuntimeId, setProdRedeployRuntimeId] = useState<string | null>(null);

    const { stageRuntimes, prodRuntimes, isStageReleaseLiveOnRuntime, isProdReleaseLiveOnRuntime } =
        useReleaseControllerRuntimeLiveFlags(projectId, stageRelease, prodRelease);

    const stageRevisionNum = stageRelease?.revision ?? null;
    const prodRevisionNum = prodRelease?.revision ?? null;
    const stageReleaseId = stageRelease?.id ?? null;
    const prodReleaseId = prodRelease?.id ?? null;

    const queryClient = useQueryClient();

    const invalidateAfterRuntimeDeploy = useCallback(
        async (env: PlatformEnvironmentType) => {
            if (projectId == null) return;
            await invalidateQueriesAfterRuntimeDeploy(queryClient, projectId, env);
        },
        [projectId, queryClient],
    );

    const stageRedeployMutation = useMutation({
        mutationFn: async (runtimeId: string) => {
            if (projectId == null) throw new Error("Missing project");
            if (chatSessionId == null) throw new Error("Missing chat session");
            if (stageRevisionNum == null) throw new Error("Missing stage revision");
            const sessionForDeploy = stageRelease?.chat_session_id ?? chatSessionId;
            const body = { revision: stageRevisionNum, chat_session_id: sessionForDeploy };
            await postRuntimeDeployStageRelease(projectId, runtimeId, body);
        },
        onSuccess: async () => {
            await invalidateAfterRuntimeDeploy(PlatformEnvironmentType.stage);
            setStageDeployRuntimePickOpen(false);
            toast.success("Stage deploy has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start stage deploy.", { position: "top-center" });
        },
    });

    const prodRedeployMutation = useMutation({
        mutationFn: async (runtimeId: string) => {
            if (projectId == null) throw new Error("Missing project");
            if (chatSessionId == null) throw new Error("Missing chat session");
            if (prodRevisionNum == null) throw new Error("Missing production revision");
            if (prodReleaseId == null) throw new Error("Missing production release id");
            const sessionForDeploy = prodRelease?.chat_session_id ?? chatSessionId;
            const body = { revision: prodRevisionNum, chat_session_id: sessionForDeploy };
            const prodRt = prodRuntimes.find((r) => r.id === runtimeId);
            const liveId = prodRt?.live_release?.id ?? null;
            const swapOtherLive = liveId != null && liveId !== prodReleaseId;
            if (swapOtherLive) {
                await detachRuntimeLiveRelease(projectId, runtimeId, body);
            } else {
                await postRuntimeDeployProductionRelease(projectId, runtimeId, body);
            }
        },
        onSuccess: async () => {
            setProductionRedeployConfirmOpen(false);
            setProdRedeployRuntimeId(null);
            await invalidateAfterRuntimeDeploy(PlatformEnvironmentType.prod);
            toast.success("Production deploy has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start production deploy.", { position: "top-center" });
        },
    });

    const productionReleaseMutation = useMutation({
        mutationFn: () => {
            if (stageRelease?.id == null) throw new Error("Missing stage release id");
            return postReleaseControllerProductionRelease(projectId!, chatSessionId!, message.id, {
                stage_release_id: stageRelease.id,
            });
        },
        onSuccess: async () => {
            setProductionConfirmOpen(false);
            await invalidateAfterRuntimeDeploy(PlatformEnvironmentType.prod);
            toast.success("Production release process has started.", { position: "top-center" });
        },
        onError: () => {
            toast.error("Could not start production release.", { position: "top-center" });
        },
    });

    const canOpenStageReleaseModal = projectId != null && chatSessionId != null && stageRelease == null;
    const canCallProductionRelease =
        stageRelease != null && prodRelease == null && projectId != null && chatSessionId != null;

    const handleStageRedeploy = useCallback(() => {
        if (stageReleaseId == null) return;
        if (stageRuntimes.length === 0) return;
        setStageDeployRuntimePickOpen(true);
    }, [stageReleaseId, stageRuntimes]);

    const handleProdRedeployClick = useCallback(() => {
        if (prodReleaseId == null) return;
        const prodRuntimeId = prodRuntimes[0]?.id;
        if (prodRuntimeId == null) return;
        setProdRedeployRuntimeId(prodRuntimeId);
        setProductionRedeployConfirmOpen(true);
    }, [prodReleaseId, prodRuntimes]);

    return {
        stageRelease,
        prodRelease,
        disabledDueToReject,
        stageRuntimes,
        prodRuntimes,
        isStageReleaseLiveOnRuntime,
        isProdReleaseLiveOnRuntime,
        stageRevisionNum,
        prodRevisionNum,
        stageReleaseId,
        prodReleaseId,
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
        canOpenStageReleaseModal,
        canCallProductionRelease,
        handleStageRedeploy,
        handleProdRedeployClick,
    };
}

export type ReleaseControllerActions = ReturnType<typeof useReleaseControllerActions>;
