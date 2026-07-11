import type { TutorialRunData } from "@/modules/tutorials/engine";

export const WRITE_AND_CALL_TUTORIAL_ID = "write-and-call-your-api" as const;

type WriteAndCallExtra = {
    projectId?: string;
    firstUnitId?: string;
    stageRuntimeId?: string;
};

export function readWriteAndCallTutorialExtra(metadata: unknown): Partial<WriteAndCallExtra> {
    if (metadata == null || typeof metadata !== "object") return {};
    const extra = (metadata as TutorialRunData<WriteAndCallExtra>).extra;
    if (extra == null || typeof extra !== "object") return {};
    return extra;
}
