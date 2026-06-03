import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { ProjectUnitTypeSectionHeading } from "@/modules/project/components/project-unit-type-section-heading";
import { postReleaseUnitPreviousByFullIds } from "@/modules/project/api";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { ChatSessionViewChangesModal, type ChatSessionUnitChangePair } from "@/modules/project-chat";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { groupUnitsByType, sortedProjectUnitTypes } from "./group-units-by-type";
import { readReleaseUnitsSearchParams } from "./release-units-search-params";

function releaseNewUnitChangePairs(
    afterUnits: ProjectUnitResponse[],
    beforeUnits: (ProjectUnitResponse | null)[],
): ChatSessionUnitChangePair[] {
    const pairs: ChatSessionUnitChangePair[] = [];
    for (let i = 0; i < afterUnits.length; i++) {
        pairs.push({ beforeUnit: beforeUnits[i] ?? null, afterUnit: afterUnits[i]! });
    }
    return pairs;
}

function UnitsGroupedByType({
    projectId,
    units,
    expandDiff,
    preparingDiff,
}: {
    projectId?: string;
    units: ProjectUnitResponse[];
    expandDiff?: (unitId: string) => void;
    preparingDiff: boolean;
}) {
    const grouped = useMemo(() => groupUnitsByType(units), [units]);
    const sortedTypes = useMemo(() => sortedProjectUnitTypes(grouped.keys()), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <ProjectUnitTypeSectionHeading unitType={unitType} />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {grouped.get(unitType)?.map((unit) => (
                            <UnitCardCompact
                                key={unit.id}
                                projectId={projectId}
                                unit={unit}
                                showChatSessionOverflowMenu
                                onExpandFullRead={expandDiff != null ? () => expandDiff(unit.id) : undefined}
                                preparePending={preparingDiff}
                                expandAriaLabel={expandDiff != null ? "View changes vs previous revision" : undefined}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function NewUnitsTab({
    projectId,
    releaseId,
    releaseUnits,
    isLoading,
    error,
}: {
    projectId?: string;
    releaseId?: string;
    releaseUnits: ProjectUnitResponse[] | undefined;
    isLoading: boolean;
    error: unknown;
}) {
    const [searchParams] = useSearchParams();
    const { allUnits } = readReleaseUnitsSearchParams(searchParams);
    const groupMode = allUnits.groupMode;

    const [viewChangesOpen, setViewChangesOpen] = useState(false);
    const [viewChangesPairs, setViewChangesPairs] = useState<ChatSessionUnitChangePair[]>([]);
    const [viewChangesActiveUnitId, setViewChangesActiveUnitId] = useState<string | undefined>(undefined);
    const [preparingViewChanges, setPreparingViewChanges] = useState(false);

    const orderedAfterUnits = useMemo(() => releaseUnits ?? [], [releaseUnits]);
    const expandDiffEligible =
        projectId != null && projectId !== "" && releaseId != null && releaseId !== "" && orderedAfterUnits.length > 0;

    const openReleaseNewUnitsDiff = useCallback(
        async (clickedUnitId: string) => {
            if (projectId == null || releaseId == null) return;
            const unitIds = orderedAfterUnits.map((u) => u.id);
            if (unitIds.length === 0) return;
            setPreparingViewChanges(true);
            try {
                const { units } = await postReleaseUnitPreviousByFullIds(projectId, releaseId, unitIds);
                setViewChangesPairs(releaseNewUnitChangePairs(orderedAfterUnits, units));
                setViewChangesActiveUnitId(clickedUnitId);
                setViewChangesOpen(true);
            } catch {
                toast.error("Could not load previous unit versions for this release.");
            } finally {
                setPreparingViewChanges(false);
            }
        },
        [projectId, releaseId, orderedAfterUnits],
    );

    const expandDiff = expandDiffEligible ? openReleaseNewUnitsDiff : undefined;

    return (
        <div className="space-y-4">
            {isLoading ? (
                <ContentLoadingState label="Loading new units…" />
            ) : error ? (
                <ContentErrorState
                    title="Failed to load new units."
                    subtitle="Try refreshing the page and try again."
                />
            ) : orderedAfterUnits.length === 0 ? (
                <ContentEmptyState
                    title="No new units found"
                    description="This release has no new units to show."
                />
            ) : groupMode === "ungrouped" ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {releaseUnits?.map((unit) => (
                        <UnitCardCompact
                            key={unit.id}
                            projectId={projectId}
                            unit={unit}
                            showChatSessionOverflowMenu
                            onExpandFullRead={expandDiff != null ? () => expandDiff(unit.id) : undefined}
                            preparePending={preparingViewChanges}
                            expandAriaLabel={expandDiff != null ? "View changes vs previous revision" : undefined}
                        />
                    ))}
                </div>
            ) : (
                <UnitsGroupedByType
                    projectId={projectId}
                    units={releaseUnits ?? []}
                    expandDiff={expandDiff}
                    preparingDiff={preparingViewChanges}
                />
            )}

            <ChatSessionViewChangesModal
                open={viewChangesOpen}
                onOpenChange={setViewChangesOpen}
                unitsChanged={viewChangesPairs}
                activeUnitId={viewChangesActiveUnitId}
            />
        </div>
    );
}
