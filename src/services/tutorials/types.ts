export type TutorialStepStatus = "idle" | "pending-action" | "interrupted" | "completed";

export type TutorialStepDefinition = {
    id: string;
    title: string;
    explanation: string;
};

export type TutorialStepMetadataMap = Record<string, never>;

export type TutorialStepMetadataFor<StepId extends string> = StepId extends keyof TutorialStepMetadataMap
    ? TutorialStepMetadataMap[StepId] | null
    : null;

export type StoredTutorialStepProgress<StepId extends string = string> = {
    stepId: StepId;
    status: TutorialStepStatus;
    metadata: TutorialStepMetadataFor<StepId>;
};

export type TutorialProgressRecord = {
    tutorialGroupId: string;
    tutorialId: string;
    steps: ReadonlyArray<StoredTutorialStepProgress>;
};
