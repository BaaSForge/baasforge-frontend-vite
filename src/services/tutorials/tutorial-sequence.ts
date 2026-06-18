import type { TutorialStepStatus } from "./types";
import { getTutorialGroup, getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "./tutorials";

export type TutorialDisplayStatus = TutorialStepStatus | "disabled";

export type TutorialProgressById = Partial<Record<TutorialId, TutorialStepStatus>>;

export function findLastNonIdleTutorialId(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): TutorialId | null {
    const tutorials = getTutorialsByGroupId(groupId);
    let last: TutorialId | null = null;

    for (const tutorial of tutorials) {
        const status = progressById[tutorial.id] ?? "idle";
        if (status !== "idle") {
            last = tutorial.id;
        }
    }

    return last;
}

export function hasAnyTutorialStartedInGroup(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): boolean {
    return findLastNonIdleTutorialId(groupId, progressById) != null;
}

export function isTutorialUnlockedInGroup(
    groupId: TutorialGroupId,
    tutorialId: TutorialId,
    progressById: TutorialProgressById,
): boolean {
    const group = getTutorialGroup(groupId);
    if (group == null || !group.isSequence) return true;

    const tutorials = getTutorialsByGroupId(groupId);
    const index = tutorials.findIndex((tutorial) => tutorial.id === tutorialId);
    if (index <= 0) return true;

    const previousTutorial = tutorials[index - 1];
    return (progressById[previousTutorial.id] ?? "idle") === "completed";
}

export function resolveTutorialDisplayStatus(
    groupId: TutorialGroupId,
    tutorialId: TutorialId,
    progressById: TutorialProgressById,
): TutorialDisplayStatus {
    if (!isTutorialUnlockedInGroup(groupId, tutorialId, progressById)) {
        return "disabled";
    }
    return progressById[tutorialId] ?? "idle";
}

export function resolveTutorialDisplayStatuses(
    groupId: TutorialGroupId,
    progressById: TutorialProgressById,
): Record<TutorialId, TutorialDisplayStatus> {
    const tutorials = getTutorialsByGroupId(groupId);
    const statuses = {} as Record<TutorialId, TutorialDisplayStatus>;

    for (const tutorial of tutorials) {
        statuses[tutorial.id] = resolveTutorialDisplayStatus(groupId, tutorial.id, progressById);
    }

    return statuses;
}
