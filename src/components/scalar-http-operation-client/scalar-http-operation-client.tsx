"use client";

import { useResolvedAppTheme } from "@/components/theme-provider/hooks";
import { cn } from "@/lib/utils";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./scalar-http-operation-embed.css";
import { useMemo } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/types/api-reference";
import { buildOpenApiDocument } from "./build-openapi-document";
import { resolveOperationUrl } from "./resolve-operation-url";
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
    requestBodyJsonSchema,
    queryParamsJsonSchema,
    responseBodyJsonSchema,
    operationSummary,
}: ScalarHttpOperationClientProps) {
    const resolvedAppTheme = useResolvedAppTheme();

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
        requestBodyJsonSchema,
        queryParamsJsonSchema,
        responseBodyJsonSchema,
        operationSummary,
        resolvedAppTheme,
    ]);

    const embedKey = `${url}\u0001${method}\u0001${operationSummary ?? ""}`;

    return (
        <div
            className={cn(
                "scalar-http-operation-client scalar-app w-full min-h-0 overflow-visible rounded-md",
                className,
            )}
        >
            <ApiReferenceReact key={embedKey} configuration={configuration} />
        </div>
    );
}
