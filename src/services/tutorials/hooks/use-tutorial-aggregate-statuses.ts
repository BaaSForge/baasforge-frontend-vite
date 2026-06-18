"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { TutorialGroupId, TutorialId } from "../tutorials";
import { getTutorialAggregateStatus, getTutorialProgressSnapshot, subscribeTutorialProgress } from "../tutorial-progress-service";
import type { TutorialStepStatus } from "../types";

export function useTutorialAggregateStatuses(
    tutorialGroupId: TutorialGroupId,
    tutorialIds: ReadonlyArray<TutorialId>,
    enabled = true,
): Record<TutorialId, TutorialStepStatus> | null {
    const version = useSyncExternalStore(subscribeTutorialProgress, getTutorialProgressSnapshot, getTutorialProgressSnapshot);
    const [statuses, setStatuses] = useState<Record<TutorialId, TutorialStepStatus> | null>(null);
    const tutorialIdsKey = tutorialIds.join("\0");

    useEffect(() => {
        if (!enabled) {
            setStatuses(null);
            return;
        }

        let alive = true;

        void (async () => {
            const entries = await Promise.all(
                tutorialIds.map(async (tutorialId) => {
                    const status = await getTutorialAggregateStatus(tutorialGroupId, tutorialId);
                    return [tutorialId, status] as const;
                }),
            );

            if (!alive) return;
            setStatuses(Object.fromEntries(entries) as Record<TutorialId, TutorialStepStatus>);
        })();

        return () => {
            alive = false;
        };
    }, [enabled, tutorialGroupId, tutorialIdsKey, tutorialIds, version]);

    return statuses;
}
