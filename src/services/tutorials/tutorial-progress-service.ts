import { clientIdbDelete, clientIdbGet, clientIdbSet } from "@/lib/client-idb-kv";
import { TUTORIAL_GROUPS, getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "./tutorials";
import type { TutorialProgressRecord, TutorialStatus } from "./types";

const PREFIX = "tutorial-progress:v1:";

const TUTORIAL_STATUSES = ["idle", "pending-action", "interrupted", "completed"] as const;

let progressVersion = 0;

const listeners = new Set<() => void>();

const pendingTutorialKeys = new Set<string>();

let hydratePendingTutorialRegistryStarted = false;

function pendingTutorialRegistryKey(tutorialGroupId: TutorialGroupId, tutorialId: TutorialId): string {
    return `${tutorialGroupId}\0${tutorialId}`;
}

function syncPendingTutorialRegistryKey(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    status: TutorialStatus,
): void {
    const key = pendingTutorialRegistryKey(tutorialGroupId, tutorialId);
    if (status === "pending-action") pendingTutorialKeys.add(key);
    else pendingTutorialKeys.delete(key);
}

export function isAnyTutorialPendingAction(): boolean {
    return pendingTutorialKeys.size > 0;
}

export function hydratePendingTutorialRegistry(): void {
    if (hydratePendingTutorialRegistryStarted || typeof globalThis.window === "undefined") return;
    hydratePendingTutorialRegistryStarted = true;

    void (async () => {
        for (const group of TUTORIAL_GROUPS) {
            for (const tutorial of getTutorialsByGroupId(group.id)) {
                const record = await getTutorialProgressRecord(group.id, tutorial.id);
                if (record?.status === "pending-action") {
                    pendingTutorialKeys.add(pendingTutorialRegistryKey(group.id, tutorial.id));
                }
            }
        }
    })();
}

function emit(): void {
    progressVersion += 1;
    for (const listener of listeners) {
        listener();
    }
}

function isTutorialStatus(value: unknown): value is TutorialStatus {
    return typeof value === "string" && (TUTORIAL_STATUSES as ReadonlyArray<string>).includes(value);
}

export function subscribeTutorialProgress(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getTutorialProgressSnapshot(): number {
    return progressVersion;
}

function progressKey(tutorialGroupId: TutorialGroupId, tutorialId: TutorialId): string {
    return `${PREFIX}${encodeURIComponent(tutorialGroupId)}:${encodeURIComponent(tutorialId)}`;
}

function normalizeProgressRecord(raw: unknown): TutorialProgressRecord | null {
    if (raw == null || typeof raw !== "object") return null;
    const record = raw as Record<string, unknown>;
    if (typeof record.tutorialGroupId !== "string" || typeof record.tutorialId !== "string") return null;
    if (!isTutorialStatus(record.status)) return null;

    return {
        tutorialGroupId: record.tutorialGroupId,
        tutorialId: record.tutorialId,
        status: record.status,
        metadata: record.metadata ?? null,
    };
}

export async function saveTutorialProgress<TMetadata = null>(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    status: TutorialStatus,
    metadata: TMetadata | null = null,
): Promise<void> {
    const record: TutorialProgressRecord = {
        tutorialGroupId,
        tutorialId,
        status,
        metadata,
    };
    syncPendingTutorialRegistryKey(tutorialGroupId, tutorialId, status);
    await clientIdbSet(progressKey(tutorialGroupId, tutorialId), record);
    emit();
}

export async function getTutorialProgressRecord(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
): Promise<TutorialProgressRecord | null> {
    const raw = await clientIdbGet<unknown>(progressKey(tutorialGroupId, tutorialId));
    return normalizeProgressRecord(raw);
}

export async function getTutorialStatus(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
): Promise<TutorialStatus> {
    const record = await getTutorialProgressRecord(tutorialGroupId, tutorialId);
    return record?.status ?? "idle";
}

export async function clearTutorialProgress(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
): Promise<void> {
    syncPendingTutorialRegistryKey(tutorialGroupId, tutorialId, "idle");
    await clientIdbDelete(progressKey(tutorialGroupId, tutorialId));
    emit();
}
