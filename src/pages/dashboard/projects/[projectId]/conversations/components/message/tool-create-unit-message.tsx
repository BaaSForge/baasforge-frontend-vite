import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolCreateUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";

function parseToolCreateUnitPayload(payload: unknown): ToolCreateUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolCreateUnitPayload;
}

function createStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Created new unit" : "Creating new unit";
}

function formatCreateUnitArgs(args: ToolCreateUnitPayload["args"] | undefined): string {
    if (!args) return "—";
    const parts: string[] = [];
    if (args.code != null && String(args.code).trim() !== "") {
        const c = String(args.code);
        parts.push(c.length > 120 ? `code: ${c.slice(0, 120)}…` : `code: ${c}`);
    }
    if (args.unit_type != null) parts.push(`unit_type: ${String(args.unit_type)}`);
    if (args.explanation != null && String(args.explanation).trim() !== "") {
        const ex = String(args.explanation);
        parts.push(ex.length > 120 ? `explanation: ${ex.slice(0, 120)}…` : `explanation: ${ex}`);
    }
    return parts.length ? parts.join(", ") : "—";
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

    return (
        <ToolUnitMutationLayout
            message={message}
            nestedMessages={nestedMessages}
            statusLine={statusLine}
            argsTooltip={formatCreateUnitArgs(payload?.args)}
            unit={unit}
            payloadError={payloadError}
        />
    );
}
