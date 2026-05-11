import type { ChatMessageWithDeliveryStatus, TextMessagePayload } from "@/modules/project-chat/types";

/**
 * Draft state used to seed the main chat composer after “edit from here”.
 * Keep this shape extensible so we can attach uploads and other metadata later without rewiring callers.
 */
export type ChatComposerPrefill = {
    text: string;
    /**
     * Reserved for non-text composer state (attachment IDs, staged files, payload slices, etc.).
     * Apply these alongside `text` in the conversations page when the composer gains matching UI/state.
     */
    extras?: Record<string, unknown>;
};

/** Maps a persisted user text message into composer prefill; extend when payloads carry files or structured fields. */
export function buildComposerPrefillFromUserTextMessage(message: ChatMessageWithDeliveryStatus): ChatComposerPrefill {
    const payload = message.payload;
    let text = "";
    if (typeof payload === "string") {
        text = payload;
    } else if (payload != null && typeof payload === "object") {
        const p = payload as TextMessagePayload;
        text = typeof p.text === "string" ? p.text : "";
    }
    return {
        text,
        // extras: populate from payload when the API stores uploads or other metadata beside `text`.
    };
}
