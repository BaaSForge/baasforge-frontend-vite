import type { ConversationDebugFromUrl } from "./parse-conversation-debug-search";
import type { ReleaseResponse } from "@/modules/project/types";
import { PlatformEnvironmentType } from "@/modules/project/types";

/**
 * Builds a minimal {@link ReleaseResponse} for inline composer chips from a parsed `?debug=` payload.
 * Full release metadata is not fetched here — only what the chip UI needs.
 */
export function releaseResponseFromConversationDebug(parsed: ConversationDebugFromUrl, projectId: string): ReleaseResponse {
    let revision = 0;
    if (parsed.release_revision != null && parsed.release_revision !== "") {
        const n = parseFloat(parsed.release_revision);
        revision = Number.isFinite(n) ? n : 0;
    }
    return {
        id: parsed.release_id,
        project_id: projectId,
        chat_session_id: null,
        brief_note: null,
        notes: null,
        revision,
        is_stage: parsed.environment === PlatformEnvironmentType.stage,
        created_at: new Date().toISOString(),
        base_production_release_id: null,
        base_production_release: null,
    };
}
