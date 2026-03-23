import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
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

    return (
        <ToolUnitMutationLayout message={message} nestedMessages={nestedMessages} statusLine={statusLine} unit={unit} />
    );
}
