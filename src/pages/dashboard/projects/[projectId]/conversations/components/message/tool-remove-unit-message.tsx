import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolRemoveUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";
import { RemoveUnitArgsModalBody } from "./tool-unit-mutation-args-modal-body";
import type { UnitSubTask } from "./unit-sub-task-checklist";

function parseToolRemoveUnitPayload(payload: unknown): ToolRemoveUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolRemoveUnitPayload;
}

function removeStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Removed unit" : "Removing unit";
}

function buildRemoveUnitSubTasks(payload: ToolRemoveUnitPayload | null): UnitSubTask[] {
    if (payload == null) return [];
    const tasks: UnitSubTask[] = [];
    if (payload.pre_check_sub_task != null) tasks.push({ label: "Pre-check", status: payload.pre_check_sub_task });
    if (payload.rule_check_sub_task != null) tasks.push({ label: "Rule check", status: payload.rule_check_sub_task });
    return tasks;
}

export function ToolRemoveUnitMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const payload = parseToolRemoveUnitPayload(message.payload);
    const unit: ProjectUnitResponse | null = payload?.removed_unit ?? null;
    const status = message.status ?? ChatMessageStatus.Generating;
    const statusLine = removeStatusLine(status);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const subTasks = buildRemoveUnitSubTasks(payload);

    return (
        <ToolUnitMutationLayout
            message={message}
            nestedMessages={nestedMessages}
            statusLine={statusLine}
            argsModalTitle="Remove unit"
            argsModalContent={<RemoveUnitArgsModalBody args={payload?.args} payloadRaw={message.payload_raw} />}
            unit={unit}
            payloadError={payloadError}
            subTasks={subTasks}
        />
    );
}
