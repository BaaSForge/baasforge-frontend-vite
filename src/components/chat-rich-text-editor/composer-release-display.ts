import type { ReleaseResponse } from "@/modules/project/types";

/** Human-readable environment label for inline composer chips (matches product wording). */
export function releaseComposerEnvironmentLabel(release: ReleaseResponse): string {
    return release.is_stage ? "stage" : "production";
}
