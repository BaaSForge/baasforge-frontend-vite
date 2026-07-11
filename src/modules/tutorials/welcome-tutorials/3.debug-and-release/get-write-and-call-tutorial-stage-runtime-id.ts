import { getTutorialProgressRecord, WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import type { WriteAndCallYourApiTutorialData } from "../2.write-and-call-your-api/types";

const WRITE_AND_CALL_TUTORIAL_ID = "write-and-call-your-api" as const;

export async function getWriteAndCallTutorialStageRuntimeId(): Promise<string | undefined> {
    const record = await getTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, WRITE_AND_CALL_TUTORIAL_ID);
    if (record == null) return undefined;

    const metadata = record.metadata;
    if (metadata == null || typeof metadata !== "object") return undefined;

    const stageRuntimeId = (metadata as WriteAndCallYourApiTutorialData).stageRuntimeId;
    return typeof stageRuntimeId === "string" ? stageRuntimeId : undefined;
}

export function tutorialRuntimeCardSelector(runtimeId: string): string {
    return `[data-runtime-id="${runtimeId}"]`;
}
