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
import { scalarSiteEmbedConfiguration } from "./scalar-site-embed";

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
            ...scalarSiteEmbedConfiguration(resolvedAppTheme !== "light"),
            content: spec,
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
