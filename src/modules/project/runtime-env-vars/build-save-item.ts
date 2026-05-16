import type { RuntimeEnvVarListItem, RuntimeEnvVarSaveItem } from "./types";
import { normalizeRuntimeEnvVarKey, runtimeValueFromListItem } from "./types";

export function buildRuntimeEnvVarSaveItem(
    key: string,
    isEncrypted: boolean,
    formValues: Record<string, string>,
    initialRow: RuntimeEnvVarListItem | undefined,
    runtimeIds: readonly string[],
): RuntimeEnvVarSaveItem | null {
    const item: RuntimeEnvVarSaveItem = { key: normalizeRuntimeEnvVarKey(key), isEncrypted };
    let hasRuntimeField = false;

    for (const runtimeId of runtimeIds) {
        const next = formValues[runtimeId] ?? "";
        if (initialRow == null) {
            item[runtimeId] = next === "" ? null : next;
            hasRuntimeField = true;
            continue;
        }

        const prev = runtimeValueFromListItem(initialRow, runtimeId);
        const prevNorm = prev ?? "";
        if (next === prevNorm) continue;
        item[runtimeId] = next === "" ? null : next;
        hasRuntimeField = true;
    }

    if (!hasRuntimeField) return null;
    return item;
}
