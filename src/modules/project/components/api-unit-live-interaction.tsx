"use client";

import { ScalarHttpOperationClient } from "@/components/scalar-http-operation-client/scalar-http-operation-client";
import { envConfig } from "@/lib/env";
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
};

export function ApiUnitLiveInteraction({ unit, stageRuntimeId, releaseIsStage }: ApiUnitLiveInteractionProps) {
    const meta = readApiUnitMetadata(unit);
    const apiBase = (envConfig.apiBaseUrl ?? "").trim().replace(/\/$/, "");
    if (apiBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">API host is not configured.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No API metadata for this unit.</div>;
    }

    const method = (meta.method ?? "POST").toString();
    const requestBodyTypescript = meta.request_body?.typescript;
    const queryParamsTypescript = meta.request_params?.typescript;
    const responseTypescript = meta.response_body?.typescript;

    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const path = useStageTrigger ? buildStageTriggerPath(unit, runtimeId) : buildProductionTriggerPath(unit);
    const operationSummary = useStageTrigger ? "Trigger (stage)" : "Trigger (production)";

    return (
        <ScalarHttpOperationClient
            url={path}
            serverBaseUrl={apiBase}
            method={method}
            requestBodyTypescript={requestBodyTypescript}
            queryParamsTypescript={queryParamsTypescript}
            responseTypescript={responseTypescript}
            operationSummary={operationSummary}
        />
    );
}
