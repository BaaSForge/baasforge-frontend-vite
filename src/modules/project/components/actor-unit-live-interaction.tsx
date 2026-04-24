"use client";

import { ScalarHttpOperationClient } from "@/components/scalar-http-operation-client/scalar-http-operation-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import type { ActorUnitMetadata, ProjectUnitResponse } from "../types";

const ACTOR_ID_PATTERN = /^[A-Za-z0-9._:-]{1,512}$/;

const HANDLER_QUERY_PARAMS_JSON_SCHEMA = JSON.stringify({
    type: "object",
    properties: {
        await: {
            type: "boolean",
            default: true,
            description:
                "When true, run the handler and wait for the JSON result. When false, publish to the actor mailbox only (fire-and-forget).",
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

function envelopeResultResponse(handlerOutputJsonSchema: string | null | undefined): string {
    const inner = parseJsonObjectRecord(handlerOutputJsonSchema);
    const resultSchema = inner ?? { description: "Handler return value (JSON)" };
    return JSON.stringify({
        type: "object",
        properties: { result: resultSchema },
        required: ["result"],
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

function buildActorPathPrefix(unit: ProjectUnitResponse, actorId: string, useStageTrigger: boolean, runtimeId: string): string {
    const { project_id, context_slug, module_slug, unit_name_slug } = unit;
    const enc = encodeURIComponent;
    const tail = `${enc(context_slug)}/${enc(module_slug)}/${enc(unit_name_slug)}/${enc(actorId)}`;
    if (useStageTrigger) {
        return `/api/v1/trigger/actor/${enc(project_id)}/stage/${enc(runtimeId)}/${tail}`;
    }
    return `/api/v1/trigger/actor/${enc(project_id)}/${tail}`;
}

export type ActorUnitLiveInteractionProps = {
    unit: ProjectUnitResponse;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    projectRuntimeBaseUrl?: string;
};

type ActorTabsProps = {
    pathPrefix: string;
    actorBase: string;
    meta: ActorUnitMetadata;
    handlerNames: string[];
    defaultTab: string;
    stageSuffix: string;
};

function ActorUnitLiveInteractionTabs({
    pathPrefix,
    actorBase,
    meta,
    handlerNames,
    defaultTab,
    stageSuffix,
}: ActorTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
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
                {handlerNames.map((name) => (
                    <TabsTrigger
                        key={name}
                        value={`handler:${name}`}
                        className="h-auto min-h-8 w-full flex-initial justify-start whitespace-normal px-2 py-1.5 text-left text-xs leading-snug break-words"
                    >
                        {name}
                    </TabsTrigger>
                ))}
                <TabsTrigger
                    value="state"
                    className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                >
                    Read state
                </TabsTrigger>
                <TabsTrigger
                    value="passivate"
                    className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                >
                    Passivate
                </TabsTrigger>
                <TabsTrigger
                    value="delete"
                    className="h-auto min-h-8 w-full flex-initial justify-start px-2 py-1.5 text-left text-xs"
                >
                    Delete instance
                </TabsTrigger>
            </TabsList>
            <div className="min-h-0 min-w-0 flex-1 p-2">
                {handlerNames.map((name) => (
                    <TabsContent key={name} value={`handler:${name}`} className="m-0 min-h-0 outline-none">
                        {activeTab === `handler:${name}` ? (
                            <ScalarHttpOperationClient
                                url={`${pathPrefix}/${encodeURIComponent(name)}`}
                                serverBaseUrl={actorBase}
                                method="POST"
                                requestBodyJsonSchema={meta.handlerInputs?.[name]?.jsonSchema ?? null}
                                queryParamsJsonSchema={HANDLER_QUERY_PARAMS_JSON_SCHEMA}
                                responseBodyJsonSchema={envelopeResultResponse(
                                    meta.handlerOutputs?.[name]?.jsonSchema ?? null,
                                )}
                                operationSummary={`Handler ${name}${stageSuffix}`}
                            />
                        ) : null}
                    </TabsContent>
                ))}
                <TabsContent value="state" className="m-0 min-h-0 outline-none">
                    {activeTab === "state" ? (
                        <ScalarHttpOperationClient
                            url={`${pathPrefix}/state`}
                            serverBaseUrl={actorBase}
                            method="GET"
                            responseBodyJsonSchema={envelopeStateResponse(meta.state?.jsonSchema ?? null)}
                            operationSummary={`Read persisted state${stageSuffix}`}
                        />
                    ) : null}
                </TabsContent>
                <TabsContent value="passivate" className="m-0 min-h-0 outline-none">
                    {activeTab === "passivate" ? (
                        <ScalarHttpOperationClient
                            url={`${pathPrefix}/passivate`}
                            serverBaseUrl={actorBase}
                            method="POST"
                            responseBodyJsonSchema='{"type":"object","properties":{"passivated":{"type":"boolean"}},"required":["passivated"]}'
                            operationSummary={`Passivate (flush / evict)${stageSuffix}`}
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
}: ActorUnitLiveInteractionProps) {
    const meta = readActorUnitMetadata(unit);
    const actorBase = (projectRuntimeBaseUrl ?? "").trim().replace(/\/$/, "");
    const [actorId, setActorId] = useState("");

    const runtimeId = stageRuntimeId?.trim() ?? "";
    const useStageTrigger = releaseIsStage === true && runtimeId !== "";
    const stageSuffix = useStageTrigger ? " (stage)" : "";

    const handlerNames = useMemo(() => {
        const inputs = meta?.handlerInputs;
        if (inputs == null || typeof inputs !== "object") return [] as string[];
        return Object.keys(inputs).sort((a, b) => a.localeCompare(b));
    }, [meta?.handlerInputs]);

    const defaultTab = useMemo(() => {
        if (handlerNames.length > 0) return `handler:${handlerNames[0]}`;
        return "state";
    }, [handlerNames]);

    const pathPrefix = useMemo(() => {
        if (!ACTOR_ID_PATTERN.test(actorId)) return null;
        return buildActorPathPrefix(unit, actorId, useStageTrigger, runtimeId);
    }, [unit, actorId, useStageTrigger, runtimeId]);

    if (actorBase === "") {
        return <div className="text-muted-foreground p-3 text-xs">No actor runtime base URL for this project.</div>;
    }
    if (meta == null) {
        return <div className="text-muted-foreground p-3 text-xs">No actor metadata for this unit.</div>;
    }

    const actorIdInvalid = actorId.length > 0 && !ACTOR_ID_PATTERN.test(actorId);

    return (
        <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
                <Label htmlFor={`actor-id-${unit.id}`} className="text-xs">
                    Actor instance id
                </Label>
                <Input
                    id={`actor-id-${unit.id}`}
                    value={actorId}
                    onChange={(e) => setActorId(e.target.value)}
                    placeholder="e.g. my-instance-1"
                    className="h-8 text-xs"
                    autoComplete="off"
                    spellCheck={false}
                />
                <p className="text-muted-foreground text-[11px] leading-snug">
                    Non-empty, up to 512 characters: letters, digits, <code className="text-[10px]">._:-</code>
                </p>
                {actorIdInvalid ? (
                    <p className="text-destructive text-xs" role="alert">
                        Invalid actor instance id.
                    </p>
                ) : null}
            </div>

            {pathPrefix == null ? (
                <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
                    Enter a valid actor instance id to load request clients.
                </div>
            ) : (
                <ActorUnitLiveInteractionTabs
                    key={`${unit.id}\u0000${defaultTab}`}
                    pathPrefix={pathPrefix}
                    actorBase={actorBase}
                    meta={meta}
                    handlerNames={handlerNames}
                    defaultTab={defaultTab}
                    stageSuffix={stageSuffix}
                />
            )}
        </div>
    );
}
