import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolModifyUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";
import { ModifyUnitArgsModalBody } from "./tool-unit-mutation-args-modal-body";
import type { UnitSubTask } from "./unit-sub-task-checklist";

function parseToolModifyUnitPayload(payload: unknown): ToolModifyUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolModifyUnitPayload;
}

function modifyStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Modified unit" : "Modifying unit";
}

function buildModifyUnitSubTasks(payload: ToolModifyUnitPayload | null): UnitSubTask[] {
    if (payload == null) return [];
    const tasks: UnitSubTask[] = [];
    if (payload.pre_check_sub_task != null) tasks.push({ label: "Pre-check", status: payload.pre_check_sub_task });
    if (payload.compiler_check_sub_task != null) tasks.push({ label: "Compiler check", status: payload.compiler_check_sub_task });
    if (payload.lint_check_sub_task != null) tasks.push({ label: "Lint check", status: payload.lint_check_sub_task });
    if (payload.rule_check_sub_task != null) tasks.push({ label: "Rule check", status: payload.rule_check_sub_task });
    return tasks;
}

export function ToolModifyUnitMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const payload = parseToolModifyUnitPayload(message.payload);
    const unit: ProjectUnitResponse | null = payload?.revised_unit ?? null;
    const status = message.status ?? ChatMessageStatus.Generating;
    const statusLine = modifyStatusLine(status);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const subTasks = buildModifyUnitSubTasks(payload);

    return (
        <ToolUnitMutationLayout
            message={message}
            nestedMessages={nestedMessages}
            statusLine={statusLine}
            argsModalTitle="Modify unit"
            argsModalContent={<ModifyUnitArgsModalBody args={payload?.args} payloadRaw={message.payload_raw} />}
            unit={unit}
            payloadError={payloadError}
            subTasks={subTasks}
        />
    );
}
