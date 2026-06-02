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
import type { ActorUnitMetadata, ProjectUnitResponse } from "../types";

const ACTOR_INSTANCE_ID_MAX_LEN = 512;

function isActorInstanceIdValid(id: string): boolean {
    return id.length >= 1 && id.length <= ACTOR_INSTANCE_ID_MAX_LEN;
}
const UNIT_SLUG_PATTERN = /^[a-z]+(-[a-z]+)*$/;

function handlerMetadataKeyToPathSegment(metadataKey: string): string {
    const c0 = metadataKey.charCodeAt(0);
    if (c0 >= 65 && c0 <= 90) return String.fromCharCode(c0 + 32) + metadataKey.slice(1);
    return metadataKey;
}

const HANDLER_QUERY_PARAMS_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        await: {
            type: "boolean",
            default: true,
            description:
                "Sync (true or omitted): response includes handler return value as result. Async (false): enqueue to mailbox only; response is { delivered: true } (requires actor NATS). Server wait is capped (~30s).",
        },
    },
});

function readActorUnitMetadata(unit: ProjectUnitResponse): ActorUnitMetadata | null {
    if (unit.unit_type !== "actor") return null;
    const m = unit.metadata;
    if (m == null || typeof m !== "object") return null;
    return m as ActorUnitMetadata;
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

function envelopeHandlerSuccessResponse(handlerOutputJsonSchema: string | null | undefined): string {
    const inner = parseJsonObjectRecord(handlerOutputJsonSchema);
    const resultSchema = inner ?? { description: "Handler return value (JSON)" };
    return JSON.stringify({
        anyOf: [
            {
                type: "object",
                properties: { result: resultSchema },
                required: ["result"],
            },
            {
                type: "object",
                properties: { delivered: { type: "boolean", const: true } },
                required: ["delivered"],
            },
        ],
    });
}

function envelopeStateResponse(stateJsonSchema: string | null | undefined): string {
    const inner = parseJsonObjectRecord(stateJsonSchema);
    const stateProp = inner ?? { description: "Persisted state (JSON)" };
    return JSON.stringify({
        type: "object",
        properties: {
            state: stateProp,
            version: { type: "number" },
        },
        required: ["state", "version"],
    });
}

function unitSlugsValid(unit: ProjectUnitResponse): boolean {
    return (
        UNIT_SLUG_PATTERN.test(unit.context_slug) &&
        UNIT_SLUG_PATTERN.test(unit.module_slug) &&
        UNIT_SLUG_PATTERN.test(unit.unit_name_slug)
    );
}

function buildActorUnitBasePath(unit: ProjectUnitResponse, useStageTrigger: boolean, runtimeId: string): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    const enc = encodeURIComponent;
    const tail = `${enc(context_slug)}/${enc(module_slug)}/${enc(unit_name_slug)}`;
    if (useStageTrigger) {
        return `/api/v1/trigger/actor/${enc(project_id)}/stage/${enc(runtimeId)}/${tail}`;
    }
    return `/api/v1/trigger/actor/${enc(project_id)}/${tail}`;
}

function collectHandlerMetadataKeys(meta: ActorUnitMetadata): string[] {
    const inKeys =
        meta.handlerInputs != null && typeof meta.handlerInputs === "object" ? Object.keys(meta.handlerInputs) : [];
    const outKeys =
        meta.handlerOutputs != null && typeof meta.handlerOutputs === "object" ? Object.keys(meta.handlerOutputs) : [];
    return [...new Set([...inKeys, ...outKeys])].sort((a, b) => a.localeCompare(b));
}

export type ActorUnitLiveInteractionProps = {
    unit: ProjectUnitResponse;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    projectRuntimeBaseUrl?: string;
    scalarEmbedReadyNotifyGeneration?: number;
    onScalarEmbedReady?: () => void;
};

const DEFAULT_ACTOR_INSTANCE_ID = "default";

type ActorTabsProps = {
    pathPrefix: string;
    actorBase: string;
    meta: ActorUnitMetadata;
    handlerMetadataKeys: string[];
    defaultTab: string;
    stageSuffix: string;
    scalarEmbedReadyNotifyGeneration: number;
    onScalarEmbedReady?: () => void;
};

function ActorUnitLiveInteractionTabs({
    pathPrefix,
    actorBase,
    meta,
    handlerMetadataKeys,
    defaultTab,
    stageSuffix,
    scalarEmbedReadyNotifyGeneration,
    onScalarEmbedReady,
}: ActorTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const { isMobile, tabsOrientation, tabsClassName, tabsListClassName, tabsTriggerClassName } =
        useScalarLiveInteractionTabsLayout();
    const setTriggerRef = useScrollActiveTabTriggerIntoView(activeTab);

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation={tabsOrientation}
            className={tabsClassName}
        >
            <ScalarLiveInteractionTabsList isMobile={isMobile} className={tabsListClassName}>
                {handlerMetadataKeys.map((metadataKey) => (
                    <TabsTriggerTracked
                        key={metadataKey}
                        onRegisterTrigger={setTriggerRef}
                        value={`handler:${metadataKey}`}
                        className={tabsTriggerClassName}
                    >
                        {metadataKey}
                    </TabsTriggerTracked>
                ))}
                {handlerMetadataKeys.length > 0 ? (
                    <ScalarLiveInteractionTabGroupsSeparator isMobile={isMobile} />
                ) : null}
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="state" className={tabsTriggerClassName}>
                    Read state
                </TabsTriggerTracked>
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="passivate" className={tabsTriggerClassName}>
                    Passivate
                </TabsTriggerTracked>
                <TabsTriggerTracked onRegisterTrigger={setTriggerRef} value="delete" className={tabsTriggerClassName}>
                    Delete instance
                </TabsTriggerTracked>
            </ScalarLiveInteractionTabsList>
            <div className="min-h-0 min-w-0 flex-1">
                {handlerMetadataKeys.map((metadataKey) => {
                    const pathSeg = handlerMetadataKeyToPathSegment(metadataKey);
                    return (
                        <TabsContent key={metadataKey} value={`handler:${metadataKey}`} className="m-0 min-h-0 outline-none">
                            {activeTab === `handler:${metadataKey}` ? (
                                <ScalarHttpOperationClient
                                    url={`${pathPrefix}/${encodeURIComponent(pathSeg)}`}
                                    serverBaseUrl={actorBase}
                                    method="POST"
                                    requestBodyJsonSchema={meta.handlerInputs?.[metadataKey]?.jsonSchema ?? null}
                                    queryParamsJsonSchema={HANDLER_QUERY_PARAMS_JSON_SCHEMA}
                                    responseBodyJsonSchema={envelopeHandlerSuccessResponse(
                                        meta.handlerOutputs?.[metadataKey]?.jsonSchema ?? null,
                                    )}
                                    operationSummary={`Handler ${pathSeg}${stageSuffix}`}
                                    onEmbedReady={onScalarEmbedReady}
                                    readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                                />
                            ) : null}
                        </TabsContent>
                    );
                })}
                <TabsContent value="state" className="m-0 min-h-0 outline-none">
                    {activeTab === "state" ? (
                        <ScalarHttpOperationClient
                            url={`${pathPrefix}/state`}
                            serverBaseUrl={actorBase}
                            method="GET"
                            responseBodyJsonSchema={envelopeStateResponse(meta.state?.jsonSchema ?? null)}
                            operationSummary={`Read persisted state${stageSuffix}`}
                            onEmbedReady={onScalarEmbedReady}
                            readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                        />
                    ) : null}
                </TabsContent>
                <TabsContent value="passivate" className="m-0 min-h-0 outline-none">
                    {activeTab === "passivate" ? (
                        <ScalarHttpOperationClient
                            url={`${pathPrefix}/passivate`}
                            serverBaseUrl={actorBase}
                            method="POST"
                            omitRequestBody
                            responseBodyJsonSchema='{"type":"object","properties":{"passivated":{"type":"boolean"}},"required":["passivated"]}'
                            operationSummary={`Passivate (flush / evict)${stageSuffix}`}
                            onEmbedReady={onScalarEmbedReady}
                            readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                        />
                    ) : null}
                </TabsContent>
                <TabsContent value="delete" className="m-0 min-h-0 outline-none">
                    {activeTab === "delete" ? (
                        <ScalarHttpOperationClient
                            url={pathPrefix}
                            serverBaseUrl={actorBase}
                            method="DELETE"
                            responseBodyJsonSchema='{"type":"object","properties":{"deleted":{"type":"boolean"}},"required":["deleted"]}'
                            operationSummary={`Delete actor instance${stageSuffix}`}
                            onEmbedReady={onScalarEmbedReady}
                            readyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                        />
                    ) : null}
                </TabsContent>
            </div>
        </Tabs>
    );
}

export function ActorUnitLiveInteraction({
    unit,
    stageRuntimeId,
    releaseIsStage,
    projectRuntimeBaseUrl,
    scalarEmbedReadyNotifyGeneration = 0,
    onScalarEmbedReady,
}: ActorUnitLiveInteractionProps) {
    const meta = readActorUnitMetadata(unit);
    const actorBase = (projectRuntimeBaseUrl ?? "").trim().replace(/\/$/, "");
    const [actorId, setActorId] = useState(DEFAULT_ACTOR_INSTANCE_ID);

    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const stageSuffix = useStageTrigger ? " (stage)" : "";

    const slugsOk = useMemo(() => unitSlugsValid(unit), [unit]);

    const handlerMetadataKeys = useMemo(() => (meta == null ? [] : collectHandlerMetadataKeys(meta)), [meta]);

    const defaultTab = useMemo(() => {
        if (handlerMetadataKeys.length > 0) return `handler:${handlerMetadataKeys[0]}`;
        return "state";
    }, [handlerMetadataKeys]);

    const pathThroughUnitSlug = useMemo(() => {
        if (!slugsOk) return null;
        return buildActorUnitBasePath(unit, useStageTrigger, runtimeId);
    }, [unit, slugsOk, useStageTrigger, runtimeId]);

    const actorIdTrimmed = actorId.trim();
    const actorIdOk = isActorInstanceIdValid(actorIdTrimmed);

    const pathPrefix = useMemo(() => {
        if (pathThroughUnitSlug == null || !actorIdOk) return null;
        return `${pathThroughUnitSlug}/${encodeURIComponent(actorIdTrimmed)}`;
    }, [pathThroughUnitSlug, actorIdTrimmed, actorIdOk]);

    if (actorBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">No actor runtime base URL for this project.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No actor metadata for this unit.</div>;
    }

    const actorIdInvalid = actorIdTrimmed.length > 0 && !actorIdOk;

    return (
        <div className="flex flex-col gap-3">
            {!slugsOk ? (
                <p className="text-destructive text-xs" role="alert">
                    Unit path slugs must be lowercase hyphen words (pattern{" "}
                    <code className="text-[10px]">^[a-z]+(-[a-z]+)*$</code>) for context, module, and unit name. Fix
                    the unit definition so trigger URLs match the runtime API.
                </p>
            ) : null}
            <div className="space-y-1.5">
                <Label htmlFor={`actor-id-${unit.id}`} className="text-xs">
                    Actor instance id
                </Label>
                <Input
                    id={`actor-id-${unit.id}`}
                    value={actorId}
                    onChange={(e) => setActorId(e.target.value)}
                    placeholder="anything"
                    className="h-8 text-xs"
                    autoComplete="off"
                    spellCheck={false}
                />
                <p className="text-muted-foreground text-[11px] leading-snug">
                    Path is <code className="text-[10px]">…/unit/{"{id}"}/{"{handler}"}</code> (handler segment is
                    camelCase from metadata). Id: up to 512 characters (URL-encoded in the path).
                </p>
                {actorIdInvalid ? (
                    <p className="text-destructive text-xs" role="alert">
                        Invalid actor instance id.
                    </p>
                ) : null}
            </div>
            {pathThroughUnitSlug == null ? (
                <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
                    Cannot build actor URLs until unit slugs are valid.
                </div>
            ) : pathPrefix == null ? (
                <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
                    Enter a valid actor instance id (required between unit name and handler in the URL).
                </div>
            ) : (
                <ActorUnitLiveInteractionTabs
                    key={`${unit.id}\u0000${pathPrefix}\u0000${defaultTab}`}
                    pathPrefix={pathPrefix}
                    actorBase={actorBase}
                    meta={meta}
                    handlerMetadataKeys={handlerMetadataKeys}
                    defaultTab={defaultTab}
                    stageSuffix={stageSuffix}
                    scalarEmbedReadyNotifyGeneration={scalarEmbedReadyNotifyGeneration}
                    onScalarEmbedReady={onScalarEmbedReady}
                />
            )}
        </div>
    );
}
