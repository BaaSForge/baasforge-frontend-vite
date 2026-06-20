import { clientIdbGet, clientIdbSet } from "@/lib/client-idb-kv";
import type { TutorialGroupId, TutorialId } from "./tutorials";
import type { TutorialProgressRecord, TutorialStatus } from "./types";

const PREFIX = "tutorial-progress:v1:";

const TUTORIAL_STATUSES = ["idle", "pending-action", "interrupted", "completed"] as const;

let progressVersion = 0;

const listeners = new Set<() => void>();

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
