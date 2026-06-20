import type { TutorialId } from "./tutorials";

export type TutorialStatus = "idle" | "pending-action" | "interrupted" | "completed";

export type TutorialMetadataMap = {
    [K in TutorialId]: never;
};

export type TutorialMetadataFor<TId extends string> = TId extends keyof TutorialMetadataMap
    ? TutorialMetadataMap[TId] | null
    : null;

export type TutorialProgressRecord<TId extends string = string> = {
    tutorialGroupId: string;
    tutorialId: TId;
    metadata: TutorialMetadataFor<TId>;
    status: TutorialStatus;
};
