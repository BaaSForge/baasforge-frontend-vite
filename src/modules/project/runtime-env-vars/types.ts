/** Matches backend `ListRuntimeEnvVarsQuery` (`isEncrypted` query param). */
export type ListRuntimeEnvVarsQuery = {
    isEncrypted?: boolean;
};

export type RuntimeEnvVarListItem = {
    key: string;
    isEncrypted: boolean;
} & Record<string, string | boolean | null | undefined>;

export type RuntimeEnvVarSaveItem = {
    key: string;
    isEncrypted?: boolean;
} & Record<string, string | null | boolean | undefined>;

export type SaveRuntimeEnvVarsRequest = {
    items: RuntimeEnvVarSaveItem[];
};

export type SaveRuntimeEnvVarsResponse = {
    items: RuntimeEnvVarSaveItem[];
};

export type DeleteRuntimeEnvVarsRequest = {
    keys: string[];
};

export type DeleteRuntimeEnvVarsResponse = {
    keys: string[];
    deletedRows: number;
};

export type RevealRuntimeEnvVarResponse = {
    key: string;
    runtime_id: string;
    value: string | null;
    isEncrypted: boolean;
};

const RUNTIME_ENV_VAR_META_KEYS = new Set(["key", "isEncrypted"]);

export function runtimeValueFromListItem(item: RuntimeEnvVarListItem, runtimeId: string): string | null {
    const raw = item[runtimeId];
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "string") return raw;
    return null;
}

export function runtimeValuesFromListItem(
    item: RuntimeEnvVarListItem,
    runtimeIds: readonly string[],
): Record<string, string | null> {
    const out: Record<string, string | null> = {};
    for (const id of runtimeIds) {
        out[id] = runtimeValueFromListItem(item, id);
    }
    return out;
}

export function isRuntimeEnvVarMetaKey(key: string): boolean {
    return RUNTIME_ENV_VAR_META_KEYS.has(key);
}

export function normalizeRuntimeEnvVarKey(key: string): string {
    return key.trim().toUpperCase();
}

const RUNTIME_ENV_VAR_KEY_PATTERN = /^[A-Z0-9_]+$/;

export function sanitizeRuntimeEnvVarKeyInput(raw: string): string {
    return raw.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

export function isValidRuntimeEnvVarKey(key: string): boolean {
    const normalized = normalizeRuntimeEnvVarKey(key);
    return normalized.length > 0 && RUNTIME_ENV_VAR_KEY_PATTERN.test(normalized);
}

export const RUNTIME_ENV_VAR_KEY_VALIDATION_MESSAGE =
    "Keys can only contain English letters, numbers, and underscores.";
