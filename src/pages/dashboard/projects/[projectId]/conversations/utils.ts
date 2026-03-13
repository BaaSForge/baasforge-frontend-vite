import type { ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { ChatSessionRoleType } from "@/modules/project-chat/types";

export function findLastUserMessageIndex(
  messages: ChatMessageWithDeliveryStatus[] | null | undefined
): number {
  if (messages == null) return -1;
  let i = messages.length - 1;
  while (i >= 0) {
    if (messages[i].role === ChatSessionRoleType.User) return i;
    i--;
  }
  return -1;
}
