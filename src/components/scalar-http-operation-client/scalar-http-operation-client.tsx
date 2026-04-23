"use client";

import { useResolvedAppTheme } from "@/components/theme-provider/hooks";
import { cn } from "@/lib/utils";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./scalar-http-operation-embed.css";
import { useMemo, useRef } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/types/api-reference";
import { buildOpenApiDocument } from "./build-openapi-document";
import { resolveOperationUrl } from "./resolve-operation-url";
import { useScalarExampleResponsesShowSchemaDefault } from "./use-scalar-example-responses-show-schema-default";
import { useScalarClientModalHostStack } from "./use-scalar-client-modal-host-stack";
import { useScalarModalLayoutCssVars } from "./use-scalar-modal-layout-css-vars";

export type ScalarHttpOperationClientProps = {
    className?: string;
    /**
     * Absolute `http(s)` URL, or a path starting with `/` together with {@link serverBaseUrl}.
     */
    url: string;
    serverBaseUrl?: string;
    method: string;
    requestBodyTypescript?: string | null;
    queryParamsTypescript?: string | null;
    responseTypescript?: string | null;
    operationSummary?: string;
};

const scalarFetch: typeof fetch = (input, init) =>
    fetch(input, {
        ...init,
        credentials: "include",
    });

export const SCALAR_HTTP_OPERATION_WORKSPACE_SLUG = "baal-scalar-http-operation-embed-v1";

export function ScalarHttpOperationClient({
    className,
    url,
    serverBaseUrl,
    method,
    requestBodyTypescript,
    queryParamsTypescript,
    responseTypescript,
    operationSummary,
}: ScalarHttpOperationClientProps) {
    const resolvedAppTheme = useResolvedAppTheme();
    const embedRootRef = useRef<HTMLDivElement>(null);

    const configuration = useMemo((): AnyApiReferenceConfiguration => {
        const { serverBaseUrl: server, path } = resolveOperationUrl(url, serverBaseUrl);
        const spec = buildOpenApiDocument({
            serverBaseUrl: server,
            path,
            method,
            requestBodyTypescript,
            queryParamsTypescript,
            responseTypescript,
            operationSummary,
        });
        return {
            content: spec,
            slug: SCALAR_HTTP_OPERATION_WORKSPACE_SLUG,
            showSidebar: false,
            hideSearch: true,
            hideDarkModeToggle: true,
            showOperationId: false,
            agent: { disabled: true },
            hideDownloadButton: true,
            hideClientButton: true,
            documentDownloadType: "none",
            hideModels: false,
            layout: "modern",
            showDeveloperTools: "never",
            expandAllResponses: true,
            darkMode: resolvedAppTheme !== "light",
            fetch: scalarFetch,
        };
    }, [
        url,
        serverBaseUrl,
        method,
        requestBodyTypescript,
        queryParamsTypescript,
        responseTypescript,
        operationSummary,
        resolvedAppTheme,
    ]);

    const embedKey = `${url}\u0001${method}\u0001${operationSummary ?? ""}`;

    useScalarExampleResponsesShowSchemaDefault(embedRootRef, embedKey);
    useScalarModalLayoutCssVars();
    useScalarClientModalHostStack(embedRootRef);

    return (
        <div
            ref={embedRootRef}
            className={cn(
                "scalar-http-operation-client scalar-app isolate w-full overflow-hidden rounded-md",
                className,
            )}
        >
            <ApiReferenceReact key={embedKey} configuration={configuration} />
        </div>
    );
}
