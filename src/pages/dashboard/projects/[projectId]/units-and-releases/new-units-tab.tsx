import { SectionTitle } from "@/components/section-title";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { capitalizeFirstLetter } from "@/lib/utils";
import { postReleaseUnitPreviousByFullIds } from "@/modules/project/api";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { ChatSessionViewChangesModal, type ChatSessionUnitChangePair } from "@/modules/project-chat";
import { LayersIcon, TextAlignJustifyIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { groupUnitsByType } from "./group-units-by-type";
import { mergeAllUnitsSearchParams, readReleaseUnitsSearchParams, type AllUnitsGroupMode } from "./release-units-search-params";

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
    const sortedTypes = useMemo(() => [...grouped.keys()].sort((a, b) => a.localeCompare(b)), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <SectionTitle>{capitalizeFirstLetter(unitType)}</SectionTitle>
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
    const [searchParams, setSearchParams] = useSearchParams();
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

    const setGroupMode = (v: AllUnitsGroupMode) => {
        try {
            localStorage.setItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE, v);
        } catch {
            // ignore
        }
        setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), { groupMode: v }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <SectionTitle className="mb-0">New units in this release</SectionTitle>
                </div>
                <ToggleGroup
                    type="single"
                    value={groupMode}
                    onValueChange={(v) => v != null && v !== "" && setGroupMode(v as AllUnitsGroupMode)}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                >
                    <ToggleGroupItem value="ungrouped">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <TextAlignJustifyIcon />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Ungrouped view</TooltipContent>
                        </Tooltip>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="grouped">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <LayersIcon />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Group by type</TooltipContent>
                        </Tooltip>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {isLoading ? (
                <div className="text-muted-foreground p-4 text-center text-sm">Loading new units…</div>
            ) : error ? (
                <div className="text-destructive p-4 text-center text-sm">Failed to load new units.</div>
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
