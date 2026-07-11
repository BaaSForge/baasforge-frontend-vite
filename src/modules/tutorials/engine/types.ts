import type { ReactNode } from "react";
import type { PinToTopOptions, TargetSpotlightOverlayPlacement } from "@/components/target-spotlight-overlay";
import type { AppEventName, AppEventPayloadMap } from "@/services/events";
import type { TutorialGroupId, TutorialId } from "@/services/tutorials";

/**
 * Declarative tutorial engine.
 *
 * The active step is always DERIVED from the current app state, never from a
 * sequence of awaited events:
 *
 * - Progress is a persisted list of completed step ids (checkpoints). The
 *   pending step is the first sequence step not yet completed.
 * - A step is only displayed while its prerequisites hold (its spotlight
 *   target exists in the DOM, and its optional `requires` condition passes).
 *   While they don't, the engine shows the step's `fallback` (a repair step
 *   such as "open the sidebar") and automatically returns to the pending step
 *   the moment prerequisites hold again.
 * - Everything is re-derived reactively (DOM mutations, navigation, store
 *   changes, app events), so back/forward/refresh/closing-things scenarios
 *   need no dedicated code.
 */

/** Pure, synchronous check against current app state (DOM, stores, URL). */
export type Condition = () => boolean;

export type StepTarget =
    | { hidden: true }
    | { elementId: string; placement?: TargetSpotlightOverlayPlacement }
    | { selector: string; placement?: TargetSpotlightOverlayPlacement }
    | { pinToTop: PinToTopOptions };

export type StepCompletion<TExtra extends Record<string, unknown>> = {
    [TEventName in AppEventName]: {
        event: TEventName;
        /** Merge data from the event payload into the persisted tutorial data. */
        assign?: (payload: AppEventPayloadMap[TEventName]) => Partial<TExtra>;
    };
}[AppEventName];

/**
 * Always-on event listener that records data into the persisted tutorial
 * data, independent of which step is pending. Use it for payloads the
 * tutorial needs later (ids etc), so the data stays correct even when the
 * user repeats an action from a fallback flow.
 */
export type TutorialRecorder<TExtra extends Record<string, unknown>> = {
    [TEventName in AppEventName]: {
        event: TEventName;
        assign: (payload: AppEventPayloadMap[TEventName], extra: Partial<TExtra>) => Partial<TExtra>;
    };
}[AppEventName];

export type TutorialStep<TExtra extends Record<string, unknown>> = {
    id: string;
    /**
     * Spotlight target. `{ hidden: true }` runs the step without a spotlight
     * (e.g. waiting for a long operation). A function form may derive the
     * target from recorded data and return null while it can't be derived yet
     * (treated as a failing prerequisite).
     */
    target: StepTarget | ((extra: Partial<TExtra>) => StepTarget | null);
    /** Optional for `{ hidden: true }` steps, which render no spotlight. */
    content?: ReactNode | ((extra: Partial<TExtra>) => ReactNode);
    /** Custom action buttons (e.g. a primary "Got it!" button). Prev/Stop are always rendered. */
    actions?: ReactNode | ((extra: Partial<TExtra>) => ReactNode);
    /**
     * Extra prerequisite beyond target presence (e.g. "sidebar is open").
     * When it fails the `fallback` step is shown after the grace period.
     */
    requires?: (extra: Partial<TExtra>) => boolean;
    /**
     * Step (usually a repair step) shown while prerequisites fail. May
     * reference any step, including an already-completed sequence step.
     */
    fallback?: string;
    /** Side effect run before prerequisites are checked (e.g. assign a spotlight id to a dynamic element). */
    prepare?: (extra: Partial<TExtra>) => void;
    /** Completes the step when the event fires while the step is pending. */
    completeOn?: AppEventName | StepCompletion<TExtra>;
    /** State-derived completion, evaluated on every revalidation. */
    isDone?: (extra: Partial<TExtra>) => boolean;
    /** Runs when the step completes; the returned partial is merged into the persisted data. */
    onComplete?: (extra: Partial<TExtra>) => Partial<TExtra> | void | Promise<Partial<TExtra> | void>;
    /** Scroll the sticky breadcrumb bar into view while this step is displayed. */
    keepStickyBarVisible?: boolean;
    /**
     * How long failing prerequisites are tolerated (rendering/network latency)
     * before falling back or interrupting. Prerequisites are re-checked the
     * moment they pass, so this is an upper bound, never a wait.
     */
    graceMs?: number;
};

export type TutorialDefinition<TExtra extends Record<string, unknown>> = {
    tutorialGroupId: TutorialGroupId;
    tutorialId: TutorialId;
    /** Ordered sequence. The pending step is the first one not completed. */
    steps: readonly TutorialStep<TExtra>[];
    /** Repair steps referenced by `fallback`. Never complete, never persist. */
    repairs?: readonly TutorialStep<TExtra>[];
    /** Shown when prerequisites fail with no usable fallback. Primary action click marks the tutorial interrupted. */
    interrupted: { content: ReactNode; actions?: ReactNode };
    /** Always-on event recorders persisting payload data into the tutorial data. */
    recorders?: readonly TutorialRecorder<TExtra>[];
    /** Extra reactivity sources (e.g. zustand store subscriptions). */
    revalidateOn?: ReadonlyArray<(listener: () => void) => () => void>;
    onCompleted?: () => void;
};

/** Persisted as the tutorial progress metadata. */
export type TutorialRunData<TExtra extends Record<string, unknown>> = {
    completedStepIds: string[];
    extra: Partial<TExtra>;
};

export type RunnerDisplay<TExtra extends Record<string, unknown>> =
    | { kind: "hidden" }
    | { kind: "step"; step: TutorialStep<TExtra>; isFallback: boolean; target: StepTarget }
    | { kind: "interrupted" };

export type RunnerPhase = "loading" | "running" | "finished";

export type RunnerSnapshot<TExtra extends Record<string, unknown>> = {
    phase: RunnerPhase;
    display: RunnerDisplay<TExtra>;
    canGoToPreviousStep: boolean;
    extra: Partial<TExtra>;
};
