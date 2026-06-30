"use client";

import { useTutorialProgressRecord, WELCOME_TUTORIALS_GROUP_ID } from "@/services/tutorials";
import type { WriteAndCallYourApiTutorialData } from "./types";

const TUTORIAL_ID = "write-and-call-your-api" as const;

export function useWriteAndCallTutorialFirstUnitId(): string | undefined {
    const record = useTutorialProgressRecord(WELCOME_TUTORIALS_GROUP_ID, TUTORIAL_ID);
    if (record?.status !== "pending-action") return undefined;

    const metadata = record.metadata;
    if (metadata == null || typeof metadata !== "object") return undefined;

    const firstUnitId = (metadata as WriteAndCallYourApiTutorialData).firstUnitId;
    return typeof firstUnitId === "string" ? firstUnitId : undefined;
}
