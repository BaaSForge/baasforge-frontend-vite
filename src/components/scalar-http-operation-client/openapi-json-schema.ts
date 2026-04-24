export type JsonSchemaLike = Record<string, unknown>;

const DEFS_REF_PREFIX = "#/$defs/";

function parseJsonObject(stored: string | null | undefined): JsonSchemaLike | null {
    const t = stored?.trim();
    if (t == null || t === "") return null;
    try {
        const v: unknown = JSON.parse(t);
        if (v !== null && typeof v === "object" && !Array.isArray(v)) return v as JsonSchemaLike;
    } catch {
        return null;
    }
    return null;
}

const MAX_DEF_REF_STEPS = 32;

function resolveRootJsonSchemaDoc(doc: JsonSchemaLike): JsonSchemaLike {
    const defs = doc.$defs;
    if (defs == null || typeof defs !== "object" || Array.isArray(defs)) return doc;
    const defMap = defs as Record<string, unknown>;
    let cur: JsonSchemaLike = doc;
    for (let step = 0; step < MAX_DEF_REF_STEPS; step++) {
        const ref = cur.$ref;
        if (typeof ref !== "string" || !ref.startsWith(DEFS_REF_PREFIX)) return cur;
        const key = ref.slice(DEFS_REF_PREFIX.length);
        const next = defMap[key];
        if (next == null || typeof next !== "object" || Array.isArray(next)) return cur;
        cur = next as JsonSchemaLike;
    }
    return cur;
}

export function jsonSchemaDocumentOrPlaceholder(label: string, jsonSchema?: string | null): JsonSchemaLike {
    const doc = parseJsonObject(jsonSchema);
    if (doc == null) return { type: "object", title: label };
    return resolveRootJsonSchemaDoc(doc);
}

export function queryParametersFromJsonSchema(schema: JsonSchemaLike): Array<Record<string, unknown>> {
    if (schema.properties == null || typeof schema.properties !== "object") {
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
