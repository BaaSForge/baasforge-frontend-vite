"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { TutorialGroupId, TutorialId } from "../tutorials";
import { getTutorialProgressRecord, getTutorialProgressSnapshot, subscribeTutorialProgress } from "../tutorial-progress-service";
import type { TutorialProgressRecord } from "../types";

export function useTutorialProgressRecord(
    tutorialGroupId: TutorialGroupId,
    tutorialId: TutorialId,
    enabled = true,
): TutorialProgressRecord | null {
    const version = useSyncExternalStore(subscribeTutorialProgress, getTutorialProgressSnapshot, getTutorialProgressSnapshot);
    const [record, setRecord] = useState<TutorialProgressRecord | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let alive = true;

        void getTutorialProgressRecord(tutorialGroupId, tutorialId).then((next) => {
            if (!alive) return;
            setRecord(next);
        });

        return () => {
            alive = false;
        };
    }, [enabled, tutorialGroupId, tutorialId, version]);

    return enabled ? record : null;
}
