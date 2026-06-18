import { clientIdbGet, clientIdbSet } from "@/lib/client-idb-kv";
import type { TutorialGroupId, TutorialId } from "./tutorials";
import type { StoredTutorialStepProgress, TutorialProgressRecord, TutorialStepStatus } from "./types";

const PREFIX = "tutorial-progress:v1:";

let progressVersion = 0;

const listeners = new Set<() => void>();

function emit(): void {
    progressVersion += 1;
    for (const listener of listeners) {
        listener();
    }
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
    if (!Array.isArray(record.steps)) return null;

    const steps: StoredTutorialStepProgress[] = [];
    for (const step of record.steps) {
        if (step == null || typeof step !== "object") continue;
        const s = step as Record<string, unknown>;
        if (typeof s.stepId !== "string") continue;
        if (s.status !== "idle" && s.status !== "pending-action" && s.status !== "interrupted" && s.status !== "completed") {
            continue;
        }
        steps.push({
            stepId: s.stepId,
            status: s.status,
            metadata: (s.metadata ?? null) as StoredTutorialStepProgress["metadata"],
        });
    }

    return {
        tutorialGroupId: record.tutorialGroupId,
        tutorialId: record.tutorialId,
        steps,
    };
}

export function resolveLastNonIdleStepStatus(
    steps: ReadonlyArray<Pick<StoredTutorialStepProgress, "status">>,
): TutorialStepStatus {
    let last: TutorialStepStatus = "idle";
    for (const step of steps) {
        if (step.status !== "idle") {
            last = step.status;
        }
    }
    return last;
}

export async function saveTutorialProgress(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    steps: ReadonlyArray<StoredTutorialStepProgress>,
): Promise<void> {
    const record: TutorialProgressRecord = {
        tutorialGroupId,
        tutorialId,
        steps,
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

export async function getTutorialAggregateStatus(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
): Promise<TutorialStepStatus> {
    const record = await getTutorialProgressRecord(tutorialGroupId, tutorialId);
    if (record == null || record.steps.length === 0) return "idle";
    return resolveLastNonIdleStepStatus(record.steps);
}
