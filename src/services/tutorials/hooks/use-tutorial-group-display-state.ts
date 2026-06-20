"use client";

import { useMemo } from "react";
import {
    getSequentialGroupActionTitleFromProgress,
    resolveSequentialGroupActionKind,
    resolveSequentialGroupTargetTutorialId,
    type SequentialGroupActionKind,
} from "../tutorial-actions";
import { resolveTutorialDisplayStatuses, type TutorialDisplayStatus } from "../tutorial-sequence";
import { getTutorialGroup, getTutorialsByGroupId, type TutorialGroupId, type TutorialId } from "../tutorials";
import { useTutorialStatuses } from "./use-tutorial-statuses";

export function useTutorialGroupDisplayState(groupId: TutorialGroupId, enabled = true): {
    displayStatuses: Record<TutorialId, TutorialDisplayStatus> | null;
    scrollToTutorialId: TutorialId | null;
    groupActionTitle: string | null;
    groupActionKind: SequentialGroupActionKind | null;
    isGroupActionDisabled: boolean;
    isLoading: boolean;
} {
    const tutorialIds = useMemo(() => getTutorialsByGroupId(groupId).map((tutorial) => tutorial.id), [groupId]);
    const statusesById = useTutorialStatuses(groupId, tutorialIds, enabled);
    const group = getTutorialGroup(groupId);

    const displayStatuses = useMemo(() => {
        if (statusesById == null) return null;
        return resolveTutorialDisplayStatuses(groupId, statusesById);
    }, [groupId, statusesById]);

    const scrollToTutorialId = useMemo(() => {
        if (statusesById == null || group?.isSequence !== true) return null;
        return resolveSequentialGroupTargetTutorialId(groupId, statusesById);
    }, [group?.isSequence, groupId, statusesById]);

    const groupActionKind = useMemo(() => {
        if (statusesById == null || group?.isSequence !== true) return null;
        return resolveSequentialGroupActionKind(groupId, statusesById);
    }, [group?.isSequence, groupId, statusesById]);

    const groupActionTitle = useMemo(() => {
        if (statusesById == null || group?.isSequence !== true) return null;
        return getSequentialGroupActionTitleFromProgress(groupId, statusesById);
    }, [group?.isSequence, groupId, statusesById]);

    const isGroupActionDisabled = groupActionKind === "all-completed";

    return {
        displayStatuses,
        scrollToTutorialId,
        groupActionTitle,
        groupActionKind,
        isGroupActionDisabled,
        isLoading: statusesById == null,
    };
}
