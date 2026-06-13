"use client";

import { DetailedUnitCard } from "@/modules/project/components/detailed-unit-card";
import type { ProjectUnitResponse } from "@/modules/project/types";

export function SharedDocumentationUnitRow({
    projectId,
    unit,
}: {
    projectId: string;
    unit: ProjectUnitResponse;
}) {
    return (
        <div className="w-full min-w-0">
            <DetailedUnitCard projectId={projectId} unit={unit} releaseIsLive />
        </div>
    );
}
