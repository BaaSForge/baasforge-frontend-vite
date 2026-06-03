import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { LayersIcon, TextAlignJustifyIcon } from "lucide-react";
import { useSearchParams } from "react-router";
import { mergeAllUnitsSearchParams, readReleaseUnitsSearchParams, type AllUnitsGroupMode } from "./release-units-search-params";

export function UnitsGroupModeToggle() {
    const [searchParams, setSearchParams] = useSearchParams();
    const groupMode = readReleaseUnitsSearchParams(searchParams).allUnits.groupMode;

    const setGroupMode = (v: AllUnitsGroupMode) => {
        try {
            localStorage.setItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE, v);
        } catch {
            // ignore
        }
        setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), { groupMode: v }));
    };

    return (
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
    );
}
