"use client";

import { ScalarHttpOperationClient } from "@/components/scalar-http-operation-client/scalar-http-operation-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsTriggerTracked } from "@/components/ui/tabs-trigger-tracked";
import { useScrollActiveTabTriggerIntoView } from "@/hooks/use-scroll-active-tab-trigger-into-view";
import { useMemo, useState } from "react";
import {
    ScalarLiveInteractionTabGroupsSeparator,
    ScalarLiveInteractionTabsList,
    useScalarLiveInteractionTabsLayout,
} from "./scalar-live-interaction-tabs";
import type { ProjectUnitResponse, QueueWorkerUnitMetadata } from "../types";

const RUN_ID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ENQUEUE_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        runId: { type: "string", format: "uuid" },
        status: { type: "string", enum: ["queued"] },
    },
    required: ["runId", "status"],
});

const RUN_STATUS_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        status: { type: "string" },
        attempt: { type: "integer", minimum: 0 },
        enqueuedAt: { type: "integer" },
        runId: { type: "string" },
    },
    required: ["status", "attempt", "enqueuedAt", "runId"],
});

const CANCEL_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: { status: { type: "string", enum: ["cancelled"] } },
    required: ["status"],
});

function readQueueWorkerUnitMetadata(unit: ProjectUnitResponse): QueueWorkerUnitMetadata | null {
    if (unit.unit_type !== "queue_worker") return null;
    const m = unit.metadata;
    if (m == null || typeof m !== "object") return null;
    return m as QueueWorkerUnitMetadata;
}

function parseJsonObjectRecord(json: string | null | undefined): Record<string, unknown> | null {
    const t = json?.trim();
    if (t == null || t === "") return null;
    try {
        const v: unknown = JSON.parse(t);
        if (v !== null && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    } catch {
        return null;
    }
    return null;
}

function queueWorkerResultEnvelopeSchema(outputJsonSchema: string | null | undefined): string {
    const inner = parseJsonObjectRecord(outputJsonSchema);
    const resultSchema = inner ?? { nullable: true, description: "Worker result JSON when available" };
    return JSON.stringify({
        type: "object",
        properties: {
            status: { type: "string" },
            result: resultSchema,
        },
        required: ["status", "result"],
    });
}

function buildQueueWorkerBasePath(unit: ProjectUnitResponse, useStageTrigger: boolean, runtimeId: string): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    const enc = encodeURIComponent;
    const tail = `${enc(context_slug)}/${enc(module_slug)}/${enc(unit_name_slug)}`;
    if (useStageTrigger) {
        return `/api/v1/trigger/workerQueue/${enc(project_id)}/stage/${enc(runtimeId)}/${tail}`;
    }
    return `/api/v1/trigger/workerQueue/${enc(project_id)}/${tail}`;
}

export type QueueWorkerUnitLiveInteractionProps = {
    unit: ProjectUnitResponse;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    projectRuntimeBaseUrl?: string;
    scalarEmbedReadyNotifyGeneration?: number;
    onScalarEmbedReady?: () => void;
};

type QueueWorkerTabsProps = {
    basePath: string;
    workerBase: string;
    meta: QueueWorkerUnitMetadata;
    runIdTrimmed: string;
    runIdValid: boolean;
    defaultTab: string;
    stageSuffix: string;
    scalarEmbedReadyNotifyGeneration: number;
    onScalarEmbedReady?: () => void;
};

function runScopedPlaceholder() {
    return (
        <div className="text-muted-foreground flex min-h-[12rem] items-center justify-center rounded-md border border-dashed px-3 text-center text-xs">
            Enter a valid run UUID above to call this endpoint.
        </div>
    );
}

function QueueWorkerUnitLiveInteractionTabs({
    basePath,
    workerBase,
    meta,
    runIdTrimmed,
    runIdValid,
    defaultTab,
    stageSuffix,
    scalarEmbedReadyNotifyGeneration,
    onScalarEmbedReady,
}: QueueWorkerTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const runPathPrefix = runIdValid ? `${basePath}/${encodeURIComponent(runIdTrimmed)}` : "";
    const { isMobile, tabsOrientation, tabsClassName, tabsListClassName, tabsTriggerClassName } =
        useScalarLiveInteractionTabsLayout();
    const setTriggerRef = useScrollActiveTabTriggerIntoView(activeTab);

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation={tabsOrientation} className={tabsClassName}>
            <ScalarLiveInteractionTabsList isMobile={isMobile} className={tabsListClassName}>
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="enqueue" className={tabsTriggerClassName}>
                    Enqueue run
                </TabsTriggerTracked>
                <ScalarLiveInteractionTabGroupsSeparator isMobile={isMobile} />
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="status" className={tabsTriggerClassName}>
                    Run status
                </TabsTriggerTracked>
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="result" className={tabsTriggerClassName}>
                    Run result
                </TabsTriggerTracked>
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="cancel" className={tabsTriggerClassName}>
                    Cancel run
                </TabsTriggerTracked>
            </ScalarLiveInteractionTabsList>
            <div className="min-h-0 min-w-0 flex-1">
                <TabsContent value="enqueue" className="m-0 min-h-0 outline-none">
                    {activeTab === "enqueue" ? (
                        <ScalarHttpOperationClient
                            url={basePath}
                            serverBaseUrl={workerBase}
                            method="POST"
                            requestBodyJsonSchema={meta.input?.jsonSchema ?? null}
                            responseBodyJsonSchema={ENQUEUE_RESPONSE_JSON_SCHEMA}
                            operationSummary={`Enqueue queue worker run${stageSuffix}`}
                            onEmbedReady={onScalarEmbedReady}
                            readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                        />
                    ) : null}
                </TabsContent>
                <TabsContent value="status" className="m-0 min-h-0 outline-none">
                    {activeTab === "status" ? (
                        runIdValid && runPathPrefix !== "" ? (
                            <ScalarHttpOperationClient
                                url={`${runPathPrefix}/status`}
                                serverBaseUrl={workerBase}
                                method="GET"
                                responseBodyJsonSchema={RUN_STATUS_RESPONSE_JSON_SCHEMA}
                                operationSummary={`Queue worker run status${stageSuffix}`}
                                onEmbedReady={onScalarEmbedReady}
                                readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                            />
                        ) : (
                            runScopedPlaceholder()
                        )
                    ) : null}
                </TabsContent>
                <TabsContent value="result" className="m-0 min-h-0 outline-none">
                    {activeTab === "result" ? (
                        runIdValid && runPathPrefix !== "" ? (
                            <ScalarHttpOperationClient
                                url={`${runPathPrefix}/result`}
                                serverBaseUrl={workerBase}
                                method="GET"
                                responseBodyJsonSchema={queueWorkerResultEnvelopeSchema(meta.output?.jsonSchema ?? null)}
                                operationSummary={`Queue worker run result${stageSuffix}`}
                                onEmbedReady={onScalarEmbedReady}
                                readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                            />
                        ) : (
                            runScopedPlaceholder()
                        )
                    ) : null}
                </TabsContent>
                <TabsContent value="cancel" className="m-0 min-h-0 outline-none">
                    {activeTab === "cancel" ? (
                        runIdValid && runPathPrefix !== "" ? (
                            <ScalarHttpOperationClient
                                url={`${runPathPrefix}/cancel`}
                                serverBaseUrl={workerBase}
                                method="POST"
                                responseBodyJsonSchema={CANCEL_RESPONSE_JSON_SCHEMA}
                                operationSummary={`Cancel queue worker run${stageSuffix}`}
                                onEmbedReady={onScalarEmbedReady}
                                readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                            />
                        ) : (
                            runScopedPlaceholder()
                        )
                    ) : null}
                </TabsContent>
            </div>
        </Tabs>
    );
}

export function QueueWorkerUnitLiveInteraction({
    unit,
    stageRuntimeId,
    releaseIsStage,
    projectRuntimeBaseUrl,
    scalarEmbedReadyNotifyGeneration = 0,
    onScalarEmbedReady,
}: QueueWorkerUnitLiveInteractionProps) {
    const meta = readQueueWorkerUnitMetadata(unit);
    const workerBase = (projectRuntimeBaseUrl ?? "").trim().replace(/\/$/, "");
    const [runId, setRunId] = useState("");
    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const stageSuffix = useStageTrigger ? " (stage)" : "";
    const basePath = useMemo(
        () => buildQueueWorkerBasePath(unit, useStageTrigger, runtimeId),
        [unit, useStageTrigger, runtimeId],
    );

    const runIdTrimmed = runId.trim();
    const runIdValid = RUN_ID_UUID.test(runIdTrimmed);
    const runIdInvalid = runIdTrimmed.length > 0 && !runIdValid;

    if (workerBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">No queue worker runtime base URL for this project.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No queue worker metadata for this unit.</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
                <Label htmlFor={`queue-run-id-${unit.id}`} className="text-xs">
                    Run id (UUID)
                </Label>
                <Input
                    id={`queue-run-id-${unit.id}`}
                    value={runId}
                    onChange={(e) => setRunId(e.target.value)}
                    placeholder="Paste runId from enqueue response"
                    className="h-8 text-xs"
                    autoComplete="off"
                    spellCheck={false}
                />
                <p className="text-muted-foreground text-[11px] leading-snug">
                    Used for status, result, and cancel. Enqueue does not require a run id.
                </p>
                {runIdInvalid ? (
                    <p className="text-destructive text-xs" role="alert">
                        Enter a valid UUID run id for run-scoped operations.
                    </p>
                ) : null}
            </div>

            <QueueWorkerUnitLiveInteractionTabs
                key={unit.id}
                basePath={basePath}
                workerBase={workerBase}
                meta={meta}
                runIdTrimmed={runIdTrimmed}
                runIdValid={runIdValid}
                defaultTab="enqueue"
                stageSuffix={stageSuffix}
                scalarEmbedReadyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                onScalarEmbedReady={onScalarEmbedReady}
            />
        </div>
    );
}
