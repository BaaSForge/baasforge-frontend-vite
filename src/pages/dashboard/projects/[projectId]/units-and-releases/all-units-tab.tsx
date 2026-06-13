"use client";

import { ReleaseUnitsAllPanel } from "@/modules/project/release-units-all/release-units-all-panel";
import { useSearchParams } from "react-router";
import { readReleaseUnitsSearchParams } from "./release-units-search-params";

export function AllUnitsTab({
    projectId,
    releaseId,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive = true,
}: {
    projectId: string;
    releaseId: string;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    releaseIsLive?: boolean;
}) {
    const [searchParams] = useSearchParams();
    const { unitsTab } = readReleaseUnitsSearchParams(searchParams);

    return (
        <ReleaseUnitsAllPanel
            projectId={projectId}
            releaseId={releaseId}
            enabled={unitsTab === "all"}
            showDocumentationShare
            showPinnedUnits
            showUnitTypesFilter
            stageRuntimeId={stageRuntimeId}
            releaseIsStage={releaseIsStage}
            releaseIsLive={releaseIsLive}
        />
    );
}
