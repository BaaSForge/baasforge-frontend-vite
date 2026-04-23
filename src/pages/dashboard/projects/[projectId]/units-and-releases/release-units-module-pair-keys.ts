import type { ContextModulePair } from "@/modules/project/types";

export const MODULE_PAIR_SEP = "\u0000";

export function modulePairKey(p: ContextModulePair): string {
    return `${p.context_slug}${MODULE_PAIR_SEP}${p.module_slug}`;
}

export function parseModulePairKey(key: string): ContextModulePair | null {
    const i = key.indexOf(MODULE_PAIR_SEP);
    if (i <= 0) return null;
    const context_slug = key.slice(0, i);
    const module_slug = key.slice(i + MODULE_PAIR_SEP.length);
    if (context_slug.length === 0 || module_slug.length === 0) return null;
    return { context_slug, module_slug };
}

export function modulePairKeyLabel(key: string): string {
    const p = parseModulePairKey(key);
    return p != null ? `${p.module_slug} (${p.context_slug})` : key;
}

export function sortPairs(a: ContextModulePair, b: ContextModulePair): number {
    const c = a.context_slug.localeCompare(b.context_slug);
    return c !== 0 ? c : a.module_slug.localeCompare(b.module_slug);
}
