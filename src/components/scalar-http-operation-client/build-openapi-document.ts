import { jsonSchemaDocumentOrPlaceholder, queryParametersFromJsonSchema } from "./openapi-json-schema";

const METHODS_WITH_BODY = new Set(["post", "put", "patch", "delete"]);

export function buildOpenApiDocument(input: {
    serverBaseUrl: string;
    path: string;
    method: string;
    requestBodyJsonSchema?: string | null;
    queryParamsJsonSchema?: string | null;
    responseBodyJsonSchema?: string | null;
    operationSummary?: string;
}): Record<string, unknown> {
    const method = input.method.trim().toLowerCase();
    if (!/^[a-z]+$/.test(method)) {
        throw new Error(`Invalid HTTP method: ${input.method}`);
    }
    const pathKey = input.path.startsWith("/") ? input.path : `/${input.path}`;
    const querySchema = jsonSchemaDocumentOrPlaceholder("Query parameters", input.queryParamsJsonSchema);
    const queryParameters = queryParametersFromJsonSchema(querySchema);
    const requestBodySchema = jsonSchemaDocumentOrPlaceholder("Request body", input.requestBodyJsonSchema);
    const responseSchema = jsonSchemaDocumentOrPlaceholder("Response body", input.responseBodyJsonSchema);

    const operation: Record<string, unknown> = {
        operationId: "operation",
        summary: input.operationSummary ?? "Request",
        responses: {
            "200": {
                description: "OK",
                content: {
                    "application/json": {
                        schema: responseSchema,
                    },
                },
            },
        },
    };

    if (queryParameters.length > 0) {
        operation.parameters = queryParameters;
    }

    if (METHODS_WITH_BODY.has(method)) {
        operation.requestBody = {
            content: {
                "application/json": {
                    schema: requestBodySchema,
                },
            },
        };
    }

    return {
        openapi: "3.1.0",
        info: {
            title: "HTTP operation",
            version: "1.0.0",
        },
        servers: [{ url: input.serverBaseUrl.replace(/\/$/, "") }],
        paths: {
            [pathKey]: {
                [method]: operation,
            },
        },
    };
}
