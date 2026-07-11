"use client";

import { useTutorialProgressRecord, WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import { readWriteAndCallTutorialExtra, WRITE_AND_CALL_TUTORIAL_ID } from "./read-tutorial-extra";

export function useWriteAndCallTutorialFirstUnitId(): string | undefined {
    const record = useTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, WRITE_AND_CALL_TUTORIAL_ID);
    if (record?.status !== "pending-action") return undefined;

    const firstUnitId = readWriteAndCallTutorialExtra(record.metadata).firstUnitId;
    return typeof firstUnitId === "string" ? firstUnitId : undefined;
}
