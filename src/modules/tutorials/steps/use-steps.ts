"use client";

import { setTargetSpotlightOverlayElementId } from "@/components/target-spotlight-overlay";
import { getTutorialProgressRecord } from "@/services/tutorials";
import { useEffect, useRef } from "react";
import { createStepContext } from "./step-context";
import type { StepDefinition, StoredStepData, TutorialStepsIdentity } from "./types";

function isStoredStepData(value: unknown): value is StoredStepData {
    return value != null && typeof value === "object" && typeof (value as StoredStepData).step === "string";
}

function resolveInitialState<TData extends StoredStepData>(
    steps: readonly StepDefinition<TData>[],
    metadata: unknown,
): TData {
    if (isStoredStepData(metadata)) {
        return metadata as TData;
    }

    const firstStepId = steps[0]?.id;
    if (firstStepId == null) {
        throw new Error("useSteps requires at least one step");
    }

    return { step: firstStepId } as TData;
}

export function useSteps<TData extends StoredStepData>(
    identity: TutorialStepsIdentity,
    steps: StepDefinition<TData>[],
): void {
    const stepsRef = useRef(steps);
    stepsRef.current = steps;

    useEffect(() => {
        let cancelled = false;
        let activeContext: ReturnType<typeof createStepContext<TData>> | null = null;

        const stepIds = stepsRef.current.map((step) => step.id);
        let state = resolveInitialState(stepsRef.current, null);

        const runStepById = async (stepId: string): Promise<void> => {
            if (cancelled) return;

            const step =
                stepsRef.current.find((entry) => entry.id === stepId) ?? stepsRef.current[0];
            if (step == null) return;

            activeContext?.dispose();
            activeContext = createStepContext<TData>({
                identity,
                stepIds,
                getState: () => state,
                setState: (next) => {
                    state = next;
                },
                runStepById,
            });

            const ctx = activeContext;

            try {
                await step.handler(ctx);
            } catch (error) {
                ctx.dispose();
                if (activeContext === ctx) {
                    activeContext = null;
                }
                throw error;
            } finally {
                if (activeContext === ctx) {
                    ctx.cleanupSubscriptions();
                }
            }
        };

        void (async () => {
            const record = await getTutorialProgressRecord(identity.tutorialGroupId, identity.tutorialId);
            if (cancelled) return;
            if (record?.status !== "pending-action") return;

            state = resolveInitialState(stepsRef.current, record.metadata);
            await runStepById(state.step);
        })();

        return () => {
            cancelled = true;
            activeContext?.dispose();
            activeContext = null;
            setTargetSpotlightOverlayElementId(null);
        };
    }, [identity.tutorialGroupId, identity.tutorialId]);
}
