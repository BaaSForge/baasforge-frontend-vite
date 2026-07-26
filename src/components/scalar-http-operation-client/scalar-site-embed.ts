import type { AnyApiReferenceConfiguration } from "@scalar/types/api-reference";
import { emitScalarHttpResponseReceived } from "@/services/events";

export const SCALAR_HTTP_OPERATION_WORKSPACE_SLUG = "baal-scalar-http-operation-embed-v1";

function emitTraceIdFromResponse(response: Response): void {
    const traceId = response.headers.get("x-trace-id")?.trim();
    if (traceId) {
        emitScalarHttpResponseReceived({ traceId });
    }
}

export const scalarCredentialsFetch: typeof fetch = (input, init) =>
    fetch(input, {
        ...init,
        credentials: "include",
    });

export function scalarSiteEmbedConfiguration(
    darkMode: boolean,
): Omit<AnyApiReferenceConfiguration, "content"> {
    return {
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
        darkMode,
        fetch: scalarCredentialsFetch,
        plugins: [
            () => ({
                name: "baal-scalar-trace-id",
                extensions: [],
                apiClientPlugins: [
                    {
                        name: "baal-scalar-trace-id-client",
                        hooks: {
                            responseReceived: ({ response }: { response: Response }) => {
                                emitTraceIdFromResponse(response);
                            },
                        },
                    },
                ],
            }),
        ],
    };
}
