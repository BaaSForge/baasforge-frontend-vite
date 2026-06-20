export type TutorialStatus = "idle" | "pending-action" | "interrupted" | "completed";

export type TutorialProgressRecord = {
    tutorialGroupId: string;
    tutorialId: string;
    metadata: unknown;
    status: TutorialStatus;
};
