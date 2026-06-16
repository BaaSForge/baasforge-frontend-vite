import type { RuntimeEnvVarListItem, RuntimeEnvVarSaveItem } from "./types";
import {
    isRuntimeEnvVarMetaKey,
    normalizeRuntimeEnvVarKey,
    runtimeValueFromListItem,
} from "./types";

function runtimeHadOldKey(item: RuntimeEnvVarListItem, runtimeId: string): boolean {
    return runtimeId in item && !isRuntimeEnvVarMetaKey(runtimeId);
}

function assignRuntimeValue(item: RuntimeEnvVarSaveItem, runtimeId: string, value: string): void {
    item[runtimeId] = value === "" ? null : value;
}

export function buildRuntimeEnvVarSaveItem(
    key: string,
    isEncrypted: boolean,
    formValues: Record<string, string>,
    initialRow: RuntimeEnvVarListItem | undefined,
    runtimeIds: readonly string[],
    encryptedTouchedRuntimes?: ReadonlySet<string>,
): RuntimeEnvVarSaveItem | null {
    const normalizedKey = normalizeRuntimeEnvVarKey(key);
    const item: RuntimeEnvVarSaveItem = { key: normalizedKey, isEncrypted };
    let hasRuntimeField = false;

    if (initialRow == null) {
        for (const runtimeId of runtimeIds) {
            assignRuntimeValue(item, runtimeId, formValues[runtimeId] ?? "");
            hasRuntimeField = true;
        }
        return hasRuntimeField ? item : null;
    }

    const previousKey = normalizeRuntimeEnvVarKey(initialRow.key);
    const keyRenamed = normalizedKey !== previousKey;
    if (keyRenamed) {
        item.previousKey = previousKey;
        hasRuntimeField = true;
    }

    const hasValueChange = runtimeIds.some((runtimeId) => {
        const next = formValues[runtimeId] ?? "";
        if (isEncrypted) {
            return encryptedTouchedRuntimes?.has(runtimeId) ?? false;
        }
        const prevNorm = runtimeValueFromListItem(initialRow, runtimeId) ?? "";
        return next !== prevNorm;
    });

    if (keyRenamed && !hasValueChange) {
        if (!isEncrypted) {
            for (const runtimeId of runtimeIds) {
                if (!runtimeHadOldKey(initialRow, runtimeId)) continue;
                assignRuntimeValue(item, runtimeId, formValues[runtimeId] ?? "");
            }
        }
    } else {
        for (const runtimeId of runtimeIds) {
            const next = formValues[runtimeId] ?? "";
            if (isEncrypted) {
                if (!(encryptedTouchedRuntimes?.has(runtimeId) ?? false)) continue;
                assignRuntimeValue(item, runtimeId, next);
                hasRuntimeField = true;
                continue;
            }

            const prevNorm = runtimeValueFromListItem(initialRow, runtimeId) ?? "";
            if (next === prevNorm) continue;
            assignRuntimeValue(item, runtimeId, next);
            hasRuntimeField = true;
        }
    }

    if (!hasRuntimeField) return null;
    return item;
}
