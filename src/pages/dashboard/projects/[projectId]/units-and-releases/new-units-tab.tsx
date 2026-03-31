import { SectionTitle } from "@/components/section-title";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { capitalizeFirstLetter } from "@/lib/utils";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { LayersIcon, TextAlignJustifyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { groupUnitsByType } from "./group-units-by-type";

type GroupMode = "ungrouped" | "grouped";

function getStoredGroupMode(): GroupMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE);
        if (stored === "ungrouped" || stored === "grouped") return stored;
    } catch {
        // ignore
    }
    return "ungrouped";
}

function UnitsGroupedByType({ projectId, units }: { projectId?: string; units: ProjectUnitResponse[] }) {
    const grouped = useMemo(() => groupUnitsByType(units), [units]);
    const sortedTypes = useMemo(() => [...grouped.keys()].sort((a, b) => a.localeCompare(b)), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <SectionTitle>{capitalizeFirstLetter(unitType)}</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {grouped.get(unitType)?.map((unit) => (
                            <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function NewUnitsTab({
    projectId,
    releaseUnits,
    isLoading,
    error,
}: {
    projectId?: string;
    releaseUnits: ProjectUnitResponse[] | undefined;
    isLoading: boolean;
    error: unknown;
}) {
    const [groupMode, setGroupMode] = useState<GroupMode>(getStoredGroupMode);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE, groupMode);
    }, [groupMode]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <SectionTitle className="mb-0">New units in this release</SectionTitle>
                    <p className="text-muted-foreground max-w-prose text-sm">
                        Grouping and view mode apply only to the new units listed below (units introduced in this release), not the full combined
                        inventory.
                    </p>
                </div>
                <ToggleGroup
                    type="single"
                    value={groupMode}
                    onValueChange={(v) => v != null && v !== "" && setGroupMode(v as GroupMode)}
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
                        <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
                    ))}
                </div>
            ) : (
                <UnitsGroupedByType projectId={projectId} units={releaseUnits ?? []} />
            )}
        </div>
    );
}
