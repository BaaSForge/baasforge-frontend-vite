"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { TutorialGroupId, TutorialId } from "../tutorials";
import { getTutorialProgressSnapshot, getTutorialStatus, subscribeTutorialProgress } from "../tutorial-progress-service";
import type { TutorialStatus } from "../types";

export function useTutorialStatuses(
    tutorialGroupId: TutorialGroupId,
    tutorialIds: ReadonlyArray<TutorialId>,
    enabled = true,
): Record<TutorialId, TutorialStatus> | null {
    const version = useSyncExternalStore(subscribeTutorialProgress, getTutorialProgressSnapshot, getTutorialProgressSnapshot);
    const [statuses, setStatuses] = useState<Record<TutorialId, TutorialStatus> | null>(null);
    const tutorialIdsKey = tutorialIds.join("\0");

    useEffect(() => {
        if (!enabled) return;

        let alive = true;

        void (async () => {
            const entries = await Promise.all(
                tutorialIds.map(async (tutorialId) => {
                    const status = await getTutorialStatus(tutorialGroupId, tutorialId);
                    return [tutorialId, status] as const;
                }),
            );

            if (!alive) return;
            setStatuses(Object.fromEntries(entries) as Record<TutorialId, TutorialStatus>);
        })();

        return () => {
            alive = false;
        };
    }, [enabled, tutorialGroupId, tutorialIdsKey, tutorialIds, version]);

    return enabled ? statuses : null;
}
