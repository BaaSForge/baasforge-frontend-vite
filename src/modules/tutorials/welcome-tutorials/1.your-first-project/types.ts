import type { TutorialProgressRecord } from "@/services/tutorials";

export type YourFirstProjectTutorialMetadata = {
    step: "inbox";
};

export type YourFirstProjectTutorialRecord = Omit<TutorialProgressRecord, "tutorialId" | "metadata"> & {
    tutorialId: "your-first-project";
    metadata: YourFirstProjectTutorialMetadata | null;
};

export function asYourFirstProjectTutorialRecord(
    record: TutorialProgressRecord | null,
): YourFirstProjectTutorialRecord | null {
    if (record == null) return null;
    return record as YourFirstProjectTutorialRecord;
}
