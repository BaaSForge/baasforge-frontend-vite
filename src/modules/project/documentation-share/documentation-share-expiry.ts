import { addDays, addMonths, format, formatDistanceToNow } from "date-fns";
import type { DocumentationShareExpiryPresetId } from "./types";

export const DOCUMENTATION_SHARE_EXPIRY_PRESETS: { id: DocumentationShareExpiryPresetId; label: string }[] = [
    { id: "1d", label: "1 day" },
    { id: "3d", label: "3 days" },
    { id: "7d", label: "7 days" },
    { id: "1m", label: "1 month" },
    { id: "6m", label: "6 months" },
    { id: "forever", label: "Forever" },
];

export function documentationShareExpiresAtForPreset(presetId: DocumentationShareExpiryPresetId): string | undefined {
    const now = new Date();
    switch (presetId) {
        case "1d":
            return addDays(now, 1).toISOString();
        case "3d":
            return addDays(now, 3).toISOString();
        case "7d":
            return addDays(now, 7).toISOString();
        case "1m":
            return addMonths(now, 1).toISOString();
        case "6m":
            return addMonths(now, 6).toISOString();
        case "forever":
            return undefined;
    }
}

export function buildDocumentationSharePageUrl(projectId: string, releaseId: string, shareSecret: string): string {
    const url = new URL(`/projects/documentation/${projectId}/share/${releaseId}`, window.location.origin);
    url.searchParams.set("share-secret", shareSecret);
    return url.toString();
}

export function formatShareExpiryAbsolute(expiresAt: string | null | undefined): string | null {
    if (expiresAt == null || expiresAt.trim() === "") return null;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "PPp");
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function isShareExpiryUrgent(expiresAt: string | null | undefined): boolean {
    if (expiresAt == null || expiresAt.trim() === "") return false;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return false;
    return date.getTime() - Date.now() <= ONE_DAY_MS;
}

export function formatShareExpiryChipLabel(expiresAt: string | null | undefined): string {
    if (expiresAt == null || expiresAt.trim() === "") return "Never expires";
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return "Unknown expiry";
    if (date.getTime() <= Date.now()) return "Expired";
    return formatDistanceToNow(date, { addSuffix: true });
}
