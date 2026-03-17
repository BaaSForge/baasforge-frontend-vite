import { ChevronDownIcon } from "lucide-react";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardChip } from "@/modules/project";
import { ChatMessageStatus, type ChatMessageWithDeliveryStatus, type ToolFetchRelevantUnitsPayload } from "@/modules/project-chat/types";

import { AiMessageStatusIcon } from "./message-icons";

function getToolFetchRelevantUnitsPayload(message: ChatMessageWithDeliveryStatus): ProjectUnitResponse[] {
    const p = message.payload as ToolFetchRelevantUnitsPayload | ProjectUnitResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ProjectUnitResponse[];
    }
    const units = (p as ToolFetchRelevantUnitsPayload)?.units;
    return Array.isArray(units) ? (units as ProjectUnitResponse[]) : [];
}

export function ToolFetchRelevantUnitsMessage({ message }: { message: ChatMessageWithDeliveryStatus }) {
    const units = getToolFetchRelevantUnitsPayload(message);
    const unitCount = units.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasUnits = unitCount > 0;

    return (
        <div className="flex w-0 min-w-full max-w-full justify-start overflow-hidden">
            <Collapsible defaultOpen={false} className="group w-full min-w-0 max-w-full overflow-hidden">
                <CollapsibleTrigger className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    <span className="font-medium text-sm">Reading relevant units</span>
                    {hasUnits && (
                        <span className="text-muted-foreground text-xs">
                            {unitCount} {unitCount === 1 ? "unit" : "units"}
                        </span>
                    )}
                    <span className="ml-2 shrink-0">
                        <AiMessageStatusIcon status={status} />
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent
                    className={cn(
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                        "outline-none min-w-0 max-w-full overflow-hidden",
                    )}
                >
                    {hasUnits && (
                        <div className="min-w-0 w-full max-w-full overflow-hidden py-2">
                            <FadedScrollArea orientation="horizontal" className="h-14 min-h-0 min-w-0 w-full max-w-full" hideScrollbar>
                                <div className="flex w-max items-stretch gap-2">
                                    {units.map((unit) => (
                                        <UnitCardChip key={unit.id} unit={unit} />
                                    ))}
                                </div>
                            </FadedScrollArea>
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
