"use client";

import { ScalarHttpOperationClient } from "@/components/scalar-http-operation-client/scalar-http-operation-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import type { ProjectUnitResponse, WorkflowUnitMetadata } from "../types";

const INSTANCE_ID_PATTERN = /^[A-Za-z0-9._:-]{1,512}$/;
const HANDLER_NAME_PATTERN = /^[A-Za-z0-9._:-]{1,256}$/;

const HANDLER_REQUEST_FALLBACK_JSON_SCHEMA = JSON.stringify({
    type: "object",
    additionalProperties: true,
    description: "Handler argument JSON (shape depends on the handler)",
});

const START_WORKFLOW_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        instanceId: { type: "string" },
        status: { type: "string", enum: ["running"] },
    },
    required: ["instanceId", "status"],
});

const WORKFLOW_STATUS_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        meta: { type: "object", additionalProperties: true },
        result: {},
        suspended: { type: "object", additionalProperties: true },
    },
    additionalProperties: true,
});

const CANCEL_WORKFLOW_RESPONSE_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: { status: { type: "string", enum: ["cancelled"] } },
    required: ["status"],
});

function readWorkflowUnitMetadata(unit: ProjectUnitResponse): WorkflowUnitMetadata | null {
    if (unit.unit_type !== "workflow") return null;
    const m = unit.metadata;
    if (m == null || typeof m !== "object") return null;
    return m as WorkflowUnitMetadata;
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

function workflowPollResultResponseSchema(outputJsonSchema: string | null | undefined): string {
    const inner = parseJsonObjectRecord(outputJsonSchema);
    const resultSchema = inner ?? { description: "Workflow result JSON when completed" };
    return JSON.stringify({
        oneOf: [
            {
                type: "object",
                properties: {
                    status: { type: "string", enum: ["completed"] },
                    result: resultSchema,
                },
                required: ["status", "result"],
            },
            {
                type: "object",
                properties: {
                    status: { type: "string", enum: ["pending"] },
                    message: { type: "string" },
                },
                required: ["status", "message"],
            },
        ],
    });
}

const HANDLER_RESPONSE_FALLBACK_JSON_SCHEMA = JSON.stringify({
    type: "object",
    additionalProperties: true,
    description: "Handler return value (JSON)",
});

function buildWorkflowBasePath(unit: ProjectUnitResponse, useStageTrigger: boolean, runtimeId: string): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    const enc = encodeURIComponent;
    const tail = `${enc(context_slug)}/${enc(module_slug)}/${enc(unit_name_slug)}`;
    if (useStageTrigger) {
        return `/api/v1/trigger/wf/${enc(project_id)}/stage/${enc(runtimeId)}/${tail}`;
    }
    return `/api/v1/trigger/wf/${enc(project_id)}/${tail}`;
}

export type WorkflowUnitLiveInteractionProps = {
    unit: ProjectUnitResponse;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    projectRuntimeBaseUrl?: string;
};

type WorkflowBodyProps = {
    unit: ProjectUnitResponse;
    meta: WorkflowUnitMetadata;
    wfBase: string;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
};

function WorkflowUnitLiveInteractionBody({
    unit,
    meta,
    wfBase,
    stageRuntimeId,
    releaseIsStage,
}: WorkflowBodyProps) {
    const [instanceId, setInstanceId] = useState("");
    const [handlerName, setHandlerName] = useState("");

    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const stageSuffix = useStageTrigger ? " (stage)" : "";

    const [activeTab, setActiveTab] = useState("start");

    const basePath = useMemo(
        () => buildWorkflowBasePath(unit, useStageTrigger, runtimeId),
        [unit, useStageTrigger, runtimeId],
    );

    const instanceSegmentReady = INSTANCE_ID_PATTERN.test(instanceId);
    const handlerSegmentReady =
        instanceSegmentReady && HANDLER_NAME_PATTERN.test(handlerName.trim()) && handlerName.trim().length > 0;

    const handlerPath = useMemo(() => {
        if (!handlerSegmentReady) return null;
        const h = handlerName.trim();
        return `${basePath}/${encodeURIComponent(instanceId)}/handlers/${encodeURIComponent(h)}`;
    }, [basePath, instanceId, handlerName, handlerSegmentReady]);

    const instanceScopedPath = useMemo(() => {
        if (!instanceSegmentReady) return null;
        return `${basePath}/${encodeURIComponent(instanceId)}`;
    }, [basePath, instanceId, instanceSegmentReady]);

    const trimmedHandlerKey = handlerName.trim();
    const handlerRequestSchema =
        meta?.handlerInputs?.[trimmedHandlerKey]?.jsonSchema ?? HANDLER_REQUEST_FALLBACK_JSON_SCHEMA;
    const handlerResponseSchema =
        meta?.handlerOutputs?.[trimmedHandlerKey]?.jsonSchema ?? HANDLER_RESPONSE_FALLBACK_JSON_SCHEMA;

    const instanceInvalid = instanceId.length > 0 && !INSTANCE_ID_PATTERN.test(instanceId);
    const handlerNameInvalid =
        handlerName.length > 0 &&
        handlerName.trim().length > 0 &&
        !HANDLER_NAME_PATTERN.test(handlerName.trim());

    return (
        <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor={`wf-instance-${unit.id}`} className="text-xs">
                        Workflow instance id
                    </Label>
                    <Input
                        id={`wf-instance-${unit.id}`}
                        value={instanceId}
                        onChange={(e) => setInstanceId(e.target.value)}
                        placeholder="From start response (instanceId)"
                        className="h-8 text-xs"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <p className="text-muted-foreground text-[11px] leading-snug">
                        Required for handler, status, cancel, and result. Letters, digits,{" "}
                        <code className="text-[10px]">._:-</code> (up to 512).
                    </p>
                    {instanceInvalid ? (
                        <p className="text-destructive text-xs" role="alert">
                            Invalid instance id.
                        </p>
                    ) : null}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`wf-handler-${unit.id}`} className="text-xs">
                        Shared handler name
                    </Label>
                    <Input
                        id={`wf-handler-${unit.id}`}
                        value={handlerName}
                        onChange={(e) => setHandlerName(e.target.value)}
                        placeholder='For "Call shared handler" tab only'
                        className="h-8 text-xs"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <p className="text-muted-foreground text-[11px] leading-snug">
                        Path segment for <code className="text-[10px]">/handlers/{"{name}"}</code>. Same character set
                        (up to 256).
                    </p>
                    {handlerNameInvalid ? (
                        <p className="text-destructive text-xs" role="alert">
                            Invalid handler name.
                        </p>
                    ) : null}
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="flex min-h-[18rem] flex-row gap-0 rounded-md border !flex-row"
            >
                <TabsList
                    className={cn(
                        "bg-muted text-muted-foreground inline-flex h-auto w-44 shrink-0 flex-col items-stretch justify-start gap-0.5 rounded-none rounded-l-md border-0 border-r p-1.5",
                    )}
                >
                    <TabsTrigger
                        value="start"
                        className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs leading-snug"
                    >
                        Start workflow
                    </TabsTrigger>
                    <TabsTrigger
                        value="handler"
                        className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs leading-snug"
                    >
                        Call shared handler
                    </TabsTrigger>
                    <TabsTrigger
                        value="status"
                        className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                    >
                        Get status
                    </TabsTrigger>
                    <TabsTrigger
                        value="cancel"
                        className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                    >
                        Cancel workflow
                    </TabsTrigger>
                    <TabsTrigger
                        value="result"
                        className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                    >
                        Get result (poll)
                    </TabsTrigger>
                </TabsList>
                <div className="min-h-0 min-w-0 flex-1 p-2">
                    <TabsContent value="start" className="m-0 min-h-0 outline-none">
                        {activeTab === "start" ? (
                            <ScalarHttpOperationClient
                                url={basePath}
                                serverBaseUrl={wfBase}
                                method="POST"
                                requestBodyJsonSchema={meta.input?.jsonSchema ?? null}
                                responseBodyJsonSchema={START_WORKFLOW_RESPONSE_JSON_SCHEMA}
                                operationSummary={`Start workflow${stageSuffix}`}
                            />
                        ) : null}
                    </TabsContent>
                    <TabsContent value="handler" className="m-0 min-h-0 outline-none">
                        {activeTab === "handler" ? (
                            handlerPath != null ? (
                                <ScalarHttpOperationClient
                                    url={handlerPath}
                                    serverBaseUrl={wfBase}
                                    method="POST"
                                    requestBodyJsonSchema={handlerRequestSchema}
                                    responseBodyJsonSchema={handlerResponseSchema}
                                    operationSummary={`Call shared handler${stageSuffix}`}
                                />
                            ) : (
                                <div className="text-muted-foreground flex min-h-[12rem] items-center justify-center rounded-md border border-dashed p-4 text-center text-xs">
                                    Enter a valid instance id and handler name to load the request client.
                                </div>
                            )
                        ) : null}
                    </TabsContent>
                    <TabsContent value="status" className="m-0 min-h-0 outline-none">
                        {activeTab === "status" ? (
                            instanceScopedPath != null ? (
                                <ScalarHttpOperationClient
                                    url={`${instanceScopedPath}/status`}
                                    serverBaseUrl={wfBase}
                                    method="GET"
                                    responseBodyJsonSchema={WORKFLOW_STATUS_RESPONSE_JSON_SCHEMA}
                                    operationSummary={`Get workflow status${stageSuffix}`}
                                />
                            ) : (
                                <div className="text-muted-foreground flex min-h-[12rem] items-center justify-center rounded-md border border-dashed p-4 text-center text-xs">
                                    Enter a valid workflow instance id to load the request client.
                                </div>
                            )
                        ) : null}
                    </TabsContent>
                    <TabsContent value="cancel" className="m-0 min-h-0 outline-none">
                        {activeTab === "cancel" ? (
                            instanceScopedPath != null ? (
                                <ScalarHttpOperationClient
                                    url={`${instanceScopedPath}/cancel`}
                                    serverBaseUrl={wfBase}
                                    method="POST"
                                    omitRequestBody
                                    responseBodyJsonSchema={CANCEL_WORKFLOW_RESPONSE_JSON_SCHEMA}
                                    operationSummary={`Cancel workflow${stageSuffix}`}
                                />
                            ) : (
                                <div className="text-muted-foreground flex min-h-[12rem] items-center justify-center rounded-md border border-dashed p-4 text-center text-xs">
                                    Enter a valid workflow instance id to load the request client.
                                </div>
                            )
                        ) : null}
                    </TabsContent>
                    <TabsContent value="result" className="m-0 min-h-0 outline-none">
                        {activeTab === "result" ? (
                            instanceScopedPath != null ? (
                                <ScalarHttpOperationClient
                                    url={`${instanceScopedPath}/result`}
                                    serverBaseUrl={wfBase}
                                    method="GET"
                                    responseBodyJsonSchema={workflowPollResultResponseSchema(meta.output?.jsonSchema)}
                                    operationSummary={`Get workflow result${stageSuffix}`}
                                />
                            ) : (
                                <div className="text-muted-foreground flex min-h-[12rem] items-center justify-center rounded-md border border-dashed p-4 text-center text-xs">
                                    Enter a valid workflow instance id to load the request client.
                                </div>
                            )
                        ) : null}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

export function WorkflowUnitLiveInteraction({
    unit,
    stageRuntimeId,
    releaseIsStage,
    projectRuntimeBaseUrl,
}: WorkflowUnitLiveInteractionProps) {
    const meta = readWorkflowUnitMetadata(unit);
    const wfBase = (projectRuntimeBaseUrl ?? "").trim().replace(/\/$/, "");

    if (wfBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">No workflow runtime base URL for this project.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No workflow metadata for this unit.</div>;
    }

    return (
        <WorkflowUnitLiveInteractionBody
            key={unit.id}
            unit={unit}
            meta={meta}
            wfBase={wfBase}
            stageRuntimeId={stageRuntimeId}
            releaseIsStage={releaseIsStage}
        />
    );
}
