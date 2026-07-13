"use client";

import { useResolvedAppTheme } from "@/components/theme-provider/hooks";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import "./scalar-http-operation-embed.css";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/types/api-reference";
import { buildOpenApiDocument } from "./build-openapi-document";
import { resolveOperationUrl } from "./resolve-operation-url";
import { ensureScalarApiReferenceStylesLoaded } from "./scalar-api-reference-styles";
import { acquireScalarHistoryUrlSyncBlock } from "./scalar-history-url-sync-block";
import { scalarSiteEmbedConfiguration } from "./scalar-site-embed";
import { useScalarHttpTestAiNudge } from "./scalar-http-test-ai-nudge";
import { useTutorialScalarTestRequestTarget } from "./use-tutorial-scalar-test-request-target";
import { useTutorialScalarSendTarget } from "./use-tutorial-scalar-send-target";
import { useTutorialScalarResponseHeadersTarget } from "./use-tutorial-scalar-response-headers-target";
import { useTutorialScalarResponseBodyTarget } from "./use-tutorial-scalar-response-body-target";
import { useScalarClientModalAppStateSync } from "./use-scalar-client-modal-app-state-sync";

const ApiReferenceReactLazy = lazy(() =>
    import("@scalar/api-reference-react").then((m) => ({ default: m.ApiReferenceReact })),
);

function ScalarHttpOperationLoading() {
    return (
        <div
            className="flex min-h-[12rem] items-center justify-center rounded-md border border-dashed bg-muted/20"
            role="status"
            aria-label="Loading API client"
        >
            <Spinner className="size-8" />
        </div>
    );
}

const SCALAR_CONTENT_MIN_HEIGHT_PX = 64;

function ScalarApiHostWithPaintGate({
    configuration,
    onEmbedReady,
    readyNotifyGeneration = 0,
}: {
    configuration: AnyApiReferenceConfiguration;
    onEmbedReady?: () => void;
    readyNotifyGeneration?: number;
}) {
    const shellRef = useRef<HTMLDivElement>(null);
    const [paintDone, setPaintDone] = useState(false);
    const finishedRef = useRef(false);

    useEffect(() => {
        return acquireScalarHistoryUrlSyncBlock();
    }, []);

    useEffect(() => {
        const shell = shellRef.current;
        if (shell == null) return;

        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setPaintDone(true);
        };

        const consider = () => {
            if (shell.scrollHeight >= SCALAR_CONTENT_MIN_HEIGHT_PX) finish();
        };

        const ro = new ResizeObserver(consider);
        ro.observe(shell);
        const mo = new MutationObserver(consider);
        mo.observe(shell, { childList: true, subtree: true, attributes: true });
        consider();

        const failSafe = window.setTimeout(finish, 12_000);
        return () => {
            ro.disconnect();
            mo.disconnect();
            window.clearTimeout(failSafe);
        };
    }, [configuration]);

    const onEmbedReadyRef = useRef(onEmbedReady);
    useEffect(() => {
        onEmbedReadyRef.current = onEmbedReady;
    }, [onEmbedReady]);
    useEffect(() => {
        if (!paintDone) return;
        onEmbedReadyRef.current?.();
    }, [paintDone, readyNotifyGeneration]);

    return (
        <div className={cn("relative w-full", !paintDone && "min-h-[12rem]")}>
            <div ref={shellRef} className="w-full min-h-0">
                <ApiReferenceReactLazy configuration={configuration} />
            </div>
            {!paintDone ? (
                <div
                    className="bg-background/85 absolute inset-0 z-[1] flex items-center justify-center rounded-md backdrop-blur-[1px]"
                    role="status"
                    aria-label="Loading API client"
                >
                    <Spinner className="size-8" />
                </div>
            ) : null}
        </div>
    );
}

function ScalarHttpOperationEmbed({
    configuration,
    onEmbedReady,
    readyNotifyGeneration,
}: {
    configuration: AnyApiReferenceConfiguration;
    onEmbedReady?: () => void;
    readyNotifyGeneration?: number;
}) {
    const [deferEmbed, setDeferEmbed] = useState(false);
    useEffect(() => {
        let cancelled = false;
        let raf2: number | undefined;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                void (async () => {
                    await ensureScalarApiReferenceStylesLoaded();
                    if (!cancelled) setDeferEmbed(true);
                })();
            });
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf1);
            if (raf2 !== undefined) cancelAnimationFrame(raf2);
        };
    }, []);

    if (!deferEmbed) return <ScalarHttpOperationLoading />;

    return (
        <Suspense fallback={<ScalarHttpOperationLoading />}>
            <ScalarApiHostWithPaintGate
                configuration={configuration}
                onEmbedReady={onEmbedReady}
                readyNotifyGeneration={readyNotifyGeneration}
            />
        </Suspense>
    );
}

export { SCALAR_HTTP_OPERATION_WORKSPACE_SLUG } from "./scalar-site-embed";
export type ScalarHttpOperationClientProps = {
    className?: string;
    /**
     * Absolute `http(s)` URL, or a path starting with `/` together with {@link serverBaseUrl}.
     */
    url: string;
    serverBaseUrl?: string;
    method: string;
    requestBodyJsonSchema?: string | null;
    queryParamsJsonSchema?: string | null;
    responseBodyJsonSchema?: string | null;
    operationSummary?: string;
    omitRequestBody?: boolean;
    onEmbedReady?: () => void;
    readyNotifyGeneration?: number;
    tutorialScalarTestRequestTargetId?: string;
    tutorialScalarSendTargetId?: string;
    tutorialScalarResponseHeadersTargetId?: string;
    tutorialScalarResponseBodyTargetId?: string;
    unitId?: string;
};

export function ScalarHttpOperationClient({
    className,
    url,
    serverBaseUrl,
    method,
    requestBodyJsonSchema,
    queryParamsJsonSchema,
    responseBodyJsonSchema,
    operationSummary,
    omitRequestBody,
    onEmbedReady,
    readyNotifyGeneration = 0,
    tutorialScalarTestRequestTargetId,
    tutorialScalarSendTargetId,
    tutorialScalarResponseHeadersTargetId,
    tutorialScalarResponseBodyTargetId,
    unitId,
}: ScalarHttpOperationClientProps) {
    const resolvedAppTheme = useResolvedAppTheme();
    const scalarHttpTestAiNudge = useScalarHttpTestAiNudge();
    const rootRef = useRef<HTMLDivElement>(null);
    useTutorialScalarTestRequestTarget(rootRef, tutorialScalarTestRequestTargetId);
    useScalarClientModalAppStateSync(rootRef, unitId);
    useTutorialScalarSendTarget(tutorialScalarSendTargetId);
    useTutorialScalarResponseHeadersTarget(tutorialScalarResponseHeadersTargetId);
    useTutorialScalarResponseBodyTarget(tutorialScalarResponseBodyTargetId);

    const configuration = useMemo((): AnyApiReferenceConfiguration => {
        const { serverBaseUrl: server, path } = resolveOperationUrl(url, serverBaseUrl);
        const spec = buildOpenApiDocument({
            serverBaseUrl: server,
            path,
            method,
            requestBodyJsonSchema,
            queryParamsJsonSchema,
            responseBodyJsonSchema,
            operationSummary,
            omitRequestBody,
        });
        return {
            ...scalarSiteEmbedConfiguration(resolvedAppTheme !== "light"),
            content: spec,
            onRequestSent: scalarHttpTestAiNudge.onRequestSent,
        };
    }, [
        url,
        serverBaseUrl,
        method,
        requestBodyJsonSchema,
        queryParamsJsonSchema,
        responseBodyJsonSchema,
        operationSummary,
        omitRequestBody,
        resolvedAppTheme,
        scalarHttpTestAiNudge.onRequestSent,
    ]);

    const embedKey = `${url}\u0001${method}\u0001${operationSummary ?? ""}\u0001${omitRequestBody === true ? "1" : "0"}`;

    return (
        <div
            ref={rootRef}
            className={cn(
                "scalar-http-operation-client scalar-app w-full min-h-0 overflow-visible rounded-md",
                className,
            )}
        >
            <ScalarHttpOperationEmbed
                key={embedKey}
                configuration={configuration}
                onEmbedReady={onEmbedReady}
                readyNotifyGeneration={readyNotifyGeneration}
            />
        </div>
    );
}
