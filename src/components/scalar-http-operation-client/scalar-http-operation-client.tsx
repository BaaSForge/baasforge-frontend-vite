"use client";

import { useResolvedAppTheme } from "@/components/theme-provider/hooks";
import { cn } from "@/lib/utils";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./scalar-http-operation-embed.css";
import { useMemo } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/types/api-reference";
import { buildOpenApiDocument } from "./build-openapi-document";
import { SCALAR_HTTP_OPERATION_WORKSPACE_SLUG, useScalarHttpOperationPreferenceStore } from "./scalar-http-operation-preference-store";
import { resolveOperationUrl } from "./resolve-operation-url";

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
    const defaultHttpClient = useScalarHttpOperationPreferenceStore((s) => s.defaultHttpClient);

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
            defaultHttpClient,
            showSidebar: false,
            hideSearch: true,
            hideDarkModeToggle: true,
            showOperationId: true,
            agent: { disabled: true },
            hideDownloadButton: true,
            hideClientButton: true,
            documentDownloadType: "none",
            hideModels: false,
            layout: "modern",
            showDeveloperTools: "never",
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
        defaultHttpClient,
    ]);

    const embedKey = `${defaultHttpClient.targetKey}\u0001${defaultHttpClient.clientKey}\u0001${url}\u0001${method}\u0001${operationSummary ?? ""}`;

    return (
        <div
            className={cn(
                "scalar-http-operation-client scalar-app isolate w-full overflow-hidden rounded-md",
                className,
            )}
        >
            <ApiReferenceReact key={embedKey} configuration={configuration} />
        </div>
    );
}
