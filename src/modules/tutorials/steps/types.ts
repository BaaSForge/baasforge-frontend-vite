import type { TutorialGroupId, TutorialId } from "@/services/tutorials";
import type { ReactNode } from "react";
import type { PinToTopOptions } from "@/components/target-spotlight-overlay";
import type { AppEventName } from "@/services/events";

export type TutorialStepsIdentity = {
    tutorialGroupId: TutorialGroupId;
    tutorialId: TutorialId;
};

export type StoredStepData = {
    step: string;
};

export type StepContext<TData extends StoredStepData> = {
    setSpotlightContent: (content: ReactNode, actions?: ReactNode) => void;
    clearSpotlightContent: () => void;
    pinToTop: (options?: PinToTopOptions) => void;
    once: (eventName: AppEventName) => Promise<unknown>;
    timeout: (delayMs: number) => Promise<void>;
    sleep: (delayMs: number) => Promise<void>;
    interval: (intervalMs: number, tick: () => void) => void;
    intervalBreak: (
        intervalMs: number,
        tick: (breakInterval: () => void) => void,
        options?: { untilReady?: () => boolean },
    ) => Promise<boolean>;
    race: (...promises: Promise<unknown>[]) => Promise<unknown[]>;
    next: (partial?: Partial<Omit<TData, "step">>) => Promise<void>;
    goTo: (stepId: string, partial?: Partial<Omit<TData, "step">>) => Promise<void>;
    getState: () => TData;
    markIdle: () => Promise<void>;
    markPendingAction: (partial?: Partial<TData>) => Promise<void>;
    markInterrupted: (partial?: Partial<TData>) => Promise<void>;
    markCompleted: (partial?: Partial<TData>) => Promise<void>;
};

export type StepDefinition<TData extends StoredStepData> = {
    id: string;
    handler: (ctx: StepContext<TData>) => Promise<void>;
};
