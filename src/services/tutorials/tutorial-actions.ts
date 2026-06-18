import type { TutorialDisplayStatus, TutorialProgressById } from "./tutorial-sequence";
import {
    findLastNonIdleTutorialId,
    resolveTutorialDisplayStatus,
} from "./tutorial-sequence";
import {
    getTutorialAggregateStatus,
    saveTutorialProgress,
} from "./tutorial-progress-service";
import { getTutorialGroup, getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "./tutorials";
import type { StoredTutorialStepProgress } from "./types";

export const TUTORIAL_ROOT_STEP_ID = "__tutorial-root__";

export type TutorialActionKind = "start" | "restart" | "continue" | "start-again" | "locked";

export type SequentialGroupActionKind = "lets-start" | "continue" | "restart" | "start-the-next" | "all-completed";

const TUTORIAL_ACTION_TITLES: Record<TutorialActionKind, string> = {
    start: "Start",
    restart: "Restart",
    continue: "Continue",
    "start-again": "Start again",
    locked: "Locked",
};

const SEQUENTIAL_GROUP_ACTION_TITLES: Record<SequentialGroupActionKind, string> = {
    "lets-start": "Let's start",
    continue: "Continue",
    restart: "Restart",
    "start-the-next": "Start the next",
    "all-completed": "All completed",
};

export function resolveTutorialActionKind(displayStatus: TutorialDisplayStatus): TutorialActionKind {
    if (displayStatus === "disabled") return "locked";
    if (displayStatus === "idle") return "start";
    if (displayStatus === "pending-action") return "continue";
    if (displayStatus === "interrupted") return "restart";
    return "start-again";
}

export function getTutorialActionTitle(kind: TutorialActionKind): string {
    return TUTORIAL_ACTION_TITLES[kind];
}

export function getTutorialActionTitleFromDisplayStatus(displayStatus: TutorialDisplayStatus): string {
    return getTutorialActionTitle(resolveTutorialActionKind(displayStatus));
}

export function resolveSequentialGroupActionKind(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): SequentialGroupActionKind {
    const tutorials = getTutorialsByGroupId(groupId);

    if (tutorials.every((tutorial) => (progressById[tutorial.id] ?? "idle") === "idle")) {
        return "lets-start";
    }

    if (tutorials.every((tutorial) => (progressById[tutorial.id] ?? "idle") === "completed")) {
        return "all-completed";
    }

    const lastNonIdleTutorialId = findLastNonIdleTutorialId(groupId, progressById);
    if (lastNonIdleTutorialId == null) return "lets-start";

    const lastStatus = progressById[lastNonIdleTutorialId] ?? "idle";
    if (lastStatus === "pending-action") return "continue";
    if (lastStatus === "interrupted") return "restart";
    if (lastStatus === "completed") return "start-the-next";

    return "lets-start";
}

export function getSequentialGroupActionTitle(kind: SequentialGroupActionKind): string {
    return SEQUENTIAL_GROUP_ACTION_TITLES[kind];
}

export function getSequentialGroupActionTitleFromProgress(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): string {
    return getSequentialGroupActionTitle(resolveSequentialGroupActionKind(groupId, progressById));
}

export function resolveSequentialGroupTargetTutorialId(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): TutorialId | null {
    const kind = resolveSequentialGroupActionKind(groupId, progressById);
    const tutorials = getTutorialsByGroupId(groupId);

    if (kind === "all-completed") return null;

    if (kind === "lets-start") {
        return tutorials[0]?.id ?? null;
    }

    if (kind === "start-the-next") {
        const lastNonIdleTutorialId = findLastNonIdleTutorialId(groupId, progressById);
        if (lastNonIdleTutorialId == null) return tutorials[0]?.id ?? null;
        const nextIndex = tutorials.findIndex((tutorial) => tutorial.id === lastNonIdleTutorialId) + 1;
        return tutorials[nextIndex]?.id ?? null;
    }

    return findLastNonIdleTutorialId(groupId, progressById);
}

export async function loadTutorialGroupProgressById(groupId: TutorialGroupId): Promise<TutorialProgressById> {
    const tutorials = getTutorialsByGroupId(groupId);
    const entries = await Promise.all(
        tutorials.map(async (tutorial) => [tutorial.id, await getTutorialAggregateStatus(groupId, tutorial.id)] as const),
    );
    return Object.fromEntries(entries) as TutorialProgressById;
}

function createPendingRootStep(): StoredTutorialStepProgress {
    return {
        stepId: TUTORIAL_ROOT_STEP_ID,
        status: "pending-action",
        metadata: null,
    };
}

export async function applyTutorialAction(
    groupId: TutorialGroupId,
    tutorialId: TutorialId,
    displayStatus: TutorialDisplayStatus,
): Promise<boolean> {
    const kind = resolveTutorialActionKind(displayStatus);

    switch (kind) {
        case "locked":
            return false;
        case "continue":
            return true;
        case "start":
        case "restart":
        case "start-again":
            await saveTutorialProgress(groupId, tutorialId, [createPendingRootStep()]);
            return true;
    }
}

export async function runTutorialAction(groupId: TutorialGroupId, tutorialId: TutorialId): Promise<boolean> {
    const progressById = await loadTutorialGroupProgressById(groupId);
    const displayStatus = resolveTutorialDisplayStatus(groupId, tutorialId, progressById);
    return applyTutorialAction(groupId, tutorialId, displayStatus);
}

export async function runSequentialTutorialGroupAction(groupId: TutorialGroupId): Promise<boolean> {
    const group = getTutorialGroup(groupId);
    if (group == null || !group.isSequence) return false;

    const progressById = await loadTutorialGroupProgressById(groupId);
    const targetTutorialId = resolveSequentialGroupTargetTutorialId(groupId, progressById);
    if (targetTutorialId == null) return false;

    const displayStatus = resolveTutorialDisplayStatus(groupId, targetTutorialId, progressById);
    return applyTutorialAction(groupId, targetTutorialId, displayStatus);
}

export async function runNonSequentialTutorialGroupAction(groupId: TutorialGroupId): Promise<boolean> {
    void groupId;
    // TODO: implement non-sequential tutorial group start
    return false;
}

export async function runTutorialGroupAction(groupId: TutorialGroupId): Promise<boolean> {
    const group = getTutorialGroup(groupId);
    if (group == null) return false;
    if (group.isSequence) return runSequentialTutorialGroupAction(groupId);
    return runNonSequentialTutorialGroupAction(groupId);
}
