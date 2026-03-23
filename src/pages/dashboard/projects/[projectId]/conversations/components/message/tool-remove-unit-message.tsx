import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolRemoveUnitPayload,
} from "@/modules/project-chat/types";

import { ToolUnitMutationLayout } from "./tool-unit-mutation-layout";

function parseToolRemoveUnitPayload(payload: unknown): ToolRemoveUnitPayload | null {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as ToolRemoveUnitPayload;
}

function removeStatusLine(status: ChatMessageStatus): string {
    return status === ChatMessageStatus.Completed ? "Removed unit" : "Removing unit";
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

    return (
        <ToolUnitMutationLayout message={message} nestedMessages={nestedMessages} statusLine={statusLine} unit={unit} />
    );
}
