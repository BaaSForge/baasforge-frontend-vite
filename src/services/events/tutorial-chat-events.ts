import { ChatMessageType, ChatSessionRoleType, type ChatMessageResponse } from "@/modules/project-chat/types";
import type { ToolCreateUnitPayload } from "@/modules/project-chat/payloads";

import { triggerAppEvent } from "./event-bus";
import { events } from "./events";

export function emitTutorialChatMessageEvents(message: ChatMessageResponse): void {
    if (message.role === ChatSessionRoleType.Ai && message.type === ChatMessageType.Text) {
        triggerAppEvent(events.MESSAGE_RECEIVED_EVENT);
    }

    if (message.type === ChatMessageType.ToolCreateUnit) {
        triggerAppEvent(events.CREATE_UNIT_RECEIVED_EVENT, message as ChatMessageResponse<ToolCreateUnitPayload>);
    }

    if (message.type === ChatMessageType.ReleaseControllerBox) {
        triggerAppEvent(events.RELEASE_CONTROLLER_RECEIVED_EVENT);
    }
}
