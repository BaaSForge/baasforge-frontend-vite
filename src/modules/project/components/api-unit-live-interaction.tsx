"use client";

import { ScalarHttpOperationClient } from "@/components/scalar-http-operation-client/scalar-http-operation-client";
import type { ApiUnitMetadata, ProjectUnitResponse } from "../types";

function readApiUnitMetadata(unit: ProjectUnitResponse): ApiUnitMetadata | null {
    if (unit.unit_type !== "api") return null;
    const m = unit.metadata;
    if (m == null || typeof m !== "object") return null;
    return m as ApiUnitMetadata;
}

function buildProductionTriggerPath(unit: ProjectUnitResponse): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    return `/api/v1/trigger/${encodeURIComponent(project_id)}/${encodeURIComponent(context_slug)}/${encodeURIComponent(module_slug)}/${encodeURIComponent(unit_name_slug)}`;
}

function buildStageTriggerPath(unit: ProjectUnitResponse, runtimeId: string): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    return `/api/v1/trigger/${encodeURIComponent(project_id)}/stage/${encodeURIComponent(runtimeId)}/${encodeURIComponent(context_slug)}/${encodeURIComponent(module_slug)}/${encodeURIComponent(unit_name_slug)}`;
}

export type ApiUnitLiveInteractionProps = {
    unit: ProjectUnitResponse;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    projectRuntimeBaseUrl?: string;
    scalarEmbedReadyNotifyGeneration?: number;
    onScalarEmbedReady?: () => void;
    tutorialScalarTestRequestTargetId?: string;
    tutorialScalarSendTargetId?: string;
    tutorialScalarResponseHeadersTargetId?: string;
    tutorialScalarResponseBodyTargetId?: string;
};

export function ApiUnitLiveInteraction({
    unit,
    stageRuntimeId,
    releaseIsStage,
    projectRuntimeBaseUrl,
    scalarEmbedReadyNotifyGeneration = 0,
    onScalarEmbedReady,
    tutorialScalarTestRequestTargetId,
    tutorialScalarSendTargetId,
    tutorialScalarResponseHeadersTargetId,
    tutorialScalarResponseBodyTargetId,
}: ApiUnitLiveInteractionProps) {
    const meta = readApiUnitMetadata(unit);
    const apiBase = (projectRuntimeBaseUrl ?? "").trim().replace(/\/$/, "");
    if (apiBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">No API runtime base URL for this project.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No API metadata for this unit.</div>;
    }

    const method = (meta.method ?? "POST").toString();
    const requestBodyJsonSchema = meta.requestBody?.jsonSchema;
    const queryParamsJsonSchema = meta.requestParams?.jsonSchema;
    const responseBodyJsonSchema = meta.responseBody?.jsonSchema;

    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const path = useStageTrigger ? buildStageTriggerPath(unit, runtimeId) : buildProductionTriggerPath(unit);
    const operationSummary = useStageTrigger ? "Trigger (stage)" : "Trigger (production)";

    return (
        <ScalarHttpOperationClient
            url={path}
            serverBaseUrl={apiBase}
            method={method}
            requestBodyJsonSchema={requestBodyJsonSchema}
            queryParamsJsonSchema={queryParamsJsonSchema}
            responseBodyJsonSchema={responseBodyJsonSchema}
            operationSummary={operationSummary}
            onEmbedReady={onScalarEmbedReady}
            readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
            tutorialScalarTestRequestTargetId={tutorialScalarTestRequestTargetId}
            tutorialScalarSendTargetId={tutorialScalarSendTargetId}
            tutorialScalarResponseHeadersTargetId={tutorialScalarResponseHeadersTargetId}
            tutorialScalarResponseBodyTargetId={tutorialScalarResponseBodyTargetId}
        />
    );
}
