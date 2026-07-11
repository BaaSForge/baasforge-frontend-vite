import { getTutorialProgressRecord, WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import {
    readWriteAndCallTutorialExtra,
    WRITE_AND_CALL_TUTORIAL_ID,
} from "../2.write-and-call-your-api/read-tutorial-extra";

export async function getWriteAndCallTutorialStageRuntimeId(): Promise<string | undefined> {
    const record = await getTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, WRITE_AND_CALL_TUTORIAL_ID);
    if (record == null) return undefined;

    const stageRuntimeId = readWriteAndCallTutorialExtra(record.metadata).stageRuntimeId;
    return typeof stageRuntimeId === "string" ? stageRuntimeId : undefined;
}

export function tutorialRuntimeCardSelector(runtimeId: string): string {
    return `[data-runtime-id="${runtimeId}"]`;
}
