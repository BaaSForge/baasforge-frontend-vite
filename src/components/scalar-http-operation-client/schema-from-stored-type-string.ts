export type JsonSchemaLike = Record<string, unknown>;

function looksLikeJsonSchema(o: JsonSchemaLike): boolean {
    if ("$ref" in o && typeof o.$ref === "string") return true;
    if ("properties" in o && typeof o.properties === "object" && o.properties !== null) return true;
    if ("type" in o && typeof o.type === "string") return true;
    if ("anyOf" in o || "oneOf" in o || "allOf" in o) return true;
    if ("items" in o) return true;
    return false;
}

export function schemaFromStoredTypeString(label: string, stored: string | null | undefined): JsonSchemaLike {
    const t = stored?.trim();
    if (t == null || t === "") {
        return { type: "object", title: label };
    }
    try {
        const parsed: unknown = JSON.parse(t);
        if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
            const o = parsed as JsonSchemaLike;
            if (looksLikeJsonSchema(o)) return o;
        }
    } catch {
        /* treat as TypeScript source text */
    }
    return {
        type: "object",
        title: label,
        description: `TypeScript (${label}):\n\n\`\`\`typescript\n${t}\n\`\`\``,
    };
}

export function queryParametersFromJsonSchema(schema: JsonSchemaLike): Array<Record<string, unknown>> {
    if (schema.type !== "object" || schema.properties == null || typeof schema.properties !== "object") {
        return [];
    }
    const props = schema.properties as Record<string, JsonSchemaLike>;
    const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
    return Object.entries(props).map(([name, propSchema]) => ({
        name,
        in: "query",
        required: required.includes(name),
        schema: propSchema,
        ...(typeof propSchema.description === "string" ? { description: propSchema.description } : {}),
    }));
}
