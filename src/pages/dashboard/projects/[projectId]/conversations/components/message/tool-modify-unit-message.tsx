import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolModifyUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";
import type { UnitSubTask } from "./unit-sub-task-checklist";

function parseToolModifyUnitPayload(payload: unknown): ToolModifyUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolModifyUnitPayload;
}

function modifyStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Modified unit" : "Modifying unit";
}

function formatModifyUnitArgs(args: ToolModifyUnitPayload["args"] | undefined): string {
    if (!args) return "—";
    const parts: string[] = [];
    if (args.unit_id != null) parts.push(`unit_id: ${String(args.unit_id)}`);
    if (args.revision != null) parts.push(`revision: ${String(args.revision)}`);
    if (args.code != null && String(args.code).trim() !== "") {
        const c = String(args.code);
        parts.push(c.length > 120 ? `code: ${c.slice(0, 120)}…` : `code: ${c}`);
    }
    if (args.explanation != null && String(args.explanation).trim() !== "") {
        const ex = String(args.explanation);
        parts.push(ex.length > 120 ? `explanation: ${ex.slice(0, 120)}…` : `explanation: ${ex}`);
    }
    return parts.length ? parts.join(", ") : "—";
}

function buildModifyUnitSubTasks(payload: ToolModifyUnitPayload | null): UnitSubTask[] {
    if (payload == null) return [];
    const tasks: UnitSubTask[] = [];
    if (payload.pre_check_sub_task != null) tasks.push({ label: "Pre-check", status: payload.pre_check_sub_task });
    if (payload.compiler_check_sub_task != null) tasks.push({ label: "Compiler check", status: payload.compiler_check_sub_task });
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
            argsTooltip={formatModifyUnitArgs(payload?.args)}
            unit={unit}
            payloadError={payloadError}
            subTasks={subTasks}
        />
    );
}
