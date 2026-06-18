"use client";

import { useMemo } from "react";
import {
    getSequentialGroupActionTitleFromProgress,
    resolveSequentialGroupActionKind,
    type SequentialGroupActionKind,
} from "../tutorial-actions";
import { findLastNonIdleTutorialId, resolveTutorialDisplayStatuses, type TutorialDisplayStatus } from "../tutorial-sequence";
import { getTutorialGroup, getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "../tutorials";
import { useTutorialAggregateStatuses } from "./use-tutorial-aggregate-statuses";

export function useTutorialGroupDisplayState(groupId: TutorialGroupId, enabled = true): {
    displayStatuses: Record<TutorialId, TutorialDisplayStatus> | null;
    lastNonIdleTutorialId: TutorialId | null;
    groupActionTitle: string | null;
    groupActionKind: SequentialGroupActionKind | null;
    isGroupActionDisabled: boolean;
    isLoading: boolean;
} {
    const tutorialIds = useMemo(() => getTutorialsByGroupId(groupId).map((tutorial) => tutorial.id), [groupId]);
    const progressById = useTutorialAggregateStatuses(groupId, tutorialIds, enabled);
    const group = getTutorialGroup(groupId);

    const displayStatuses = useMemo(() => {
        if (progressById == null) return null;
        return resolveTutorialDisplayStatuses(groupId, progressById);
    }, [groupId, progressById]);

    const lastNonIdleTutorialId = useMemo(() => {
        if (progressById == null) return null;
        return findLastNonIdleTutorialId(groupId, progressById);
    }, [groupId, progressById]);

    const groupActionKind = useMemo(() => {
        if (progressById == null || group?.isSequence !== true) return null;
        return resolveSequentialGroupActionKind(groupId, progressById);
    }, [group?.isSequence, groupId, progressById]);

    const groupActionTitle = useMemo(() => {
        if (progressById == null || group?.isSequence !== true) return null;
        return getSequentialGroupActionTitleFromProgress(groupId, progressById);
    }, [group?.isSequence, groupId, progressById]);

    const isGroupActionDisabled = groupActionKind === "all-completed";

    return {
        displayStatuses,
        lastNonIdleTutorialId,
        groupActionTitle,
        groupActionKind,
        isGroupActionDisabled,
        isLoading: progressById == null,
    };
}
