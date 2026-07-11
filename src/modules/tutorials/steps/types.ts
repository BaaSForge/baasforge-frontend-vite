import type { TutorialGroupId, TutorialId } from "@/services/tutorials";
import type { ReactNode } from "react";
import type { PinToTopOptions, TargetSpotlightOverlayPlacement } from "@/components/target-spotlight-overlay";
import type { AppEventName, AppEventPayloadMap } from "@/services/events";

export type TutorialStepsIdentity = {
    tutorialGroupId: TutorialGroupId;
    tutorialId: TutorialId;
};

export type StoredStepData = {
    step: string;
    projectId?: string;
};

export class IntervalSupersededError extends Error {
    readonly name = "IntervalSupersededError";

    constructor() {
        super("Interval tick superseded by next tick");
    }
}

export type IntervalBreakOptions = {
    untilReady?: () => boolean;
    untilReadyTimeoutMs?: number;
};

export type IntervalContext = {
    once: <TEventName extends AppEventName>(eventName: TEventName) => Promise<AppEventPayloadMap[TEventName]>;
    sleep: (delayMs: number) => Promise<void>;
    timeout: (delayMs: number) => Promise<void>;
    race: <T extends readonly [...unknown[]]>(
        ...promises: { [K in keyof T]: Promise<T[K]> }
    ) => Promise<{ [K in keyof T]: T[K] | undefined }>;
    intervalBreak: (
        intervalMs: number,
        tick: (breakInterval: () => void) => void,
        options?: IntervalBreakOptions,
    ) => Promise<boolean>;
};

export type StepContext<TData extends StoredStepData> = {
    setSpotlightContent: (content: ReactNode, actions?: ReactNode) => void;
    clearSpotlightContent: () => void;
    pinToTop: (options?: PinToTopOptions) => void;
    setSpotlightPlacement: (placement: TargetSpotlightOverlayPlacement) => void;
    once: <TEventName extends AppEventName>(eventName: TEventName) => Promise<AppEventPayloadMap[TEventName]>;
    timeout: (delayMs: number) => Promise<void>;
    sleep: (delayMs: number) => Promise<void>;
    interval: (
        intervalMs: number,
        tick: (intervalCtx: IntervalContext) => void | Promise<void>,
        options?: { immediate?: boolean },
    ) => void;
    intervalBreak: (
        intervalMs: number,
        tick: (breakInterval: () => void) => void,
        options?: { untilReady?: () => boolean; untilReadyTimeoutMs?: number },
    ) => Promise<boolean>;
    race: <T extends readonly [...unknown[]]>(...promises: { [K in keyof T]: Promise<T[K]> }) => Promise<{ [K in keyof T]: T[K] | undefined }>;
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
    handler: (ctx: StepContext<TData>, tickNumber: number) => Promise<void>;
};
