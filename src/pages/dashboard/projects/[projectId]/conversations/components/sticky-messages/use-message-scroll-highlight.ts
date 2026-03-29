import { useStickyMessageOptional } from "./sticky-message-groups-context";

/** True while the scroll-to-message pulse is active for this id (drives per–message-type highlight UI). */
export function useIsMessageScrollHighlighted(messageId: string): boolean {
    const ctx = useStickyMessageOptional();
    return ctx?.highlightedMessageId === messageId;
}
