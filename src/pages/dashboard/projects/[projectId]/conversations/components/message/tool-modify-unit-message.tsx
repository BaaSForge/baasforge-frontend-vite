import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolModifyUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";

function parseToolModifyUnitPayload(payload: unknown): ToolModifyUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolModifyUnitPayload;
}

function modifyStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Modified unit" : "Modifying unit";
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

    return (
        <ToolUnitMutationLayout message={message} nestedMessages={nestedMessages} statusLine={statusLine} unit={unit} />
    );
}
