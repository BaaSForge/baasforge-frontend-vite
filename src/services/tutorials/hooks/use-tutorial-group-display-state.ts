"use client";

import { useMemo } from "react";
import { findLastNonIdleTutorialId, resolveTutorialDisplayStatuses } from "../tutorial-sequence";
import { getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "../tutorials";
import { useTutorialAggregateStatuses } from "./use-tutorial-aggregate-statuses";
import type { TutorialDisplayStatus } from "../tutorial-sequence";

export function useTutorialGroupDisplayState(groupId: TutorialGroupId, enabled = true): {
    displayStatuses: Record<TutorialId, TutorialDisplayStatus> | null;
    lastNonIdleTutorialId: TutorialId | null;
    isLoading: boolean;
} {
    const tutorialIds = useMemo(() => getTutorialsByGroupId(groupId).map((tutorial) => tutorial.id), [groupId]);
    const progressById = useTutorialAggregateStatuses(groupId, tutorialIds, enabled);

    const displayStatuses = useMemo(() => {
        if (progressById == null) return null;
        return resolveTutorialDisplayStatuses(groupId, progressById);
    }, [groupId, progressById]);

    const lastNonIdleTutorialId = useMemo(() => {
        if (progressById == null) return null;
        return findLastNonIdleTutorialId(groupId, progressById);
    }, [groupId, progressById]);

    return {
        displayStatuses,
        lastNonIdleTutorialId,
        isLoading: progressById == null,
    };
}
