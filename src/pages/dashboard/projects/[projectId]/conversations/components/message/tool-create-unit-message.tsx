import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolCreateUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";
import { CreateUnitArgsModalBody } from "./tool-unit-mutation-args-modal-body";
import type { UnitSubTask } from "./unit-sub-task-checklist";

function parseToolCreateUnitPayload(payload: unknown): ToolCreateUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolCreateUnitPayload;
}

function createStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Created new unit" : "Creating new unit";
}

function buildCreateUnitSubTasks(payload: ToolCreateUnitPayload | null): UnitSubTask[] {
    if (payload == null) return [];
    const tasks: UnitSubTask[] = [];
    if (payload.pre_check_sub_task != null) tasks.push({ label: "Pre-check", status: payload.pre_check_sub_task });
    if (payload.compiler_check_sub_task != null) tasks.push({ label: "Compiler check", status: payload.compiler_check_sub_task });
    if (payload.lint_check_sub_task != null) tasks.push({ label: "Lint check", status: payload.lint_check_sub_task });
    if (payload.rule_check_sub_task != null) tasks.push({ label: "Rule check", status: payload.rule_check_sub_task });
    return tasks;
}

export function ToolCreateUnitMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const payload = parseToolCreateUnitPayload(message.payload);
    const unit: ProjectUnitResponse | null = payload?.created_unit ?? null;
    const status = message.status ?? ChatMessageStatus.Generating;
    const statusLine = createStatusLine(status);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);
    const subTasks = buildCreateUnitSubTasks(payload);

    return (
        <ToolUnitMutationLayout
            message={message}
            nestedMessages={nestedMessages}
            statusLine={statusLine}
            argsModalTitle="Create unit"
            argsModalContent={<CreateUnitArgsModalBody args={payload?.args} payloadRaw={message.payload_raw} />}
            unit={unit}
            payloadError={payloadError}
            subTasks={subTasks}
        />
    );
}
