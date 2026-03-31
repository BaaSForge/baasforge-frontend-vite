import type { ReleaseResponse } from "./types";

/**
 * Production release created from an earlier prod revision (has a base) but nothing has been
 * released on top of it yet — i.e. it is not an ancestor of another release in the project list.
 * Such rows are not “shipped” until deployed to the production runtime.
 */
export function isUndeployedProductionLeaf(release: ReleaseResponse, allReleases: ReleaseResponse[]): boolean {
    if (release.is_stage) return false;
    if (release.base_production_release_id == null) return false;
    return !allReleases.some((r) => r.base_production_release_id === release.id);
}
