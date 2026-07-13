"use client";

import { DetailedUnitCard } from "@/modules/project/components/detailed-unit-card";
import { projectUnitStablePath } from "@/modules/project/project-unit-stable-path";
import type { ProjectUnitResponse } from "@/modules/project/types";
import {
    tutorialFirstUnitLiveInteractionButtonId,
    tutorialFirstUnitScalarResponseBodySectionId,
    tutorialFirstUnitScalarResponseHeadersButtonId,
    tutorialFirstUnitScalarSendButtonId,
    tutorialFirstUnitScalarTestRequestButtonId,
} from "@/modules/tutorials/welcome-tutorials/2.write-and-call-your-api/tutorial-target-ids";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AllUnitsFlagTestedIconButton } from "./all-units-flag-tested-icon-button";
import { AllUnitsPinButton } from "./all-units-pin-button";
import { useAllUnitsUnitFlagTested } from "./use-all-units-unit-flag-tested";

export type AllUnitsUnitRowProps = {
    projectId: string;
    unit: ProjectUnitResponse;
    cardPinned: boolean;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    releaseIsLive?: boolean;
    onPin: (unit: ProjectUnitResponse) => void;
    onUnpinPath: (path: string) => void;
};

export function AllUnitsUnitRow({
    projectId,
    unit,
    cardPinned,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive = true,
    onPin,
    onUnpinPath,
}: AllUnitsUnitRowProps) {
    const { flagged, toggle } = useAllUnitsUnitFlagTested(projectId, unit);
    const [emphasisPanels, setEmphasisPanels] = useState(false);
    const tutorialLiveInteractionTargetId =
        tutorialFirstUnitLiveInteractionButtonId(unit.id);
    const tutorialScalarTestRequestTargetId =
        tutorialFirstUnitScalarTestRequestButtonId(unit.id);
    const tutorialScalarSendTargetId =
        tutorialFirstUnitScalarSendButtonId(unit.id);
    const tutorialScalarResponseHeadersTargetId =
        tutorialFirstUnitScalarResponseHeadersButtonId(unit.id);
    const tutorialScalarResponseBodyTargetId =
        tutorialFirstUnitScalarResponseBodySectionId(unit.id);

    return (
        <div
            className={cn(
                "w-full min-w-0",
                flagged && "transition-opacity duration-150",
                flagged && !emphasisPanels && "opacity-50 hover:opacity-100 focus-within:opacity-100",
                flagged && emphasisPanels && "opacity-100",
            )}
        >
            <DetailedUnitCard
                projectId={projectId}
                unit={unit}
                showChatSessionOverflowMenu
                stageRuntimeId={stageRuntimeId}
                releaseIsStage={releaseIsStage}
                releaseIsLive={releaseIsLive}
                tutorialLiveInteractionTargetId={tutorialLiveInteractionTargetId}
                tutorialScalarTestRequestTargetId={tutorialScalarTestRequestTargetId}
                tutorialScalarSendTargetId={tutorialScalarSendTargetId}
                tutorialScalarResponseHeadersTargetId={tutorialScalarResponseHeadersTargetId}
                tutorialScalarResponseBodyTargetId={tutorialScalarResponseBodyTargetId}
                onPanelEmphasisChange={setEmphasisPanels}
                leadingHeaderToolbar={
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                        <AllUnitsPinButton
                            pinned={cardPinned}
                            onPin={() => void onPin(unit)}
                            onUnpin={() => void onUnpinPath(projectUnitStablePath(unit))}
                        />
                        <AllUnitsFlagTestedIconButton flagged={flagged} onToggle={() => void toggle()} />
                    </div>
                }
            />
        </div>
    );
}
