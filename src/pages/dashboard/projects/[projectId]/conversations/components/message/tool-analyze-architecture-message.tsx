import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardChip } from "@/modules/project";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolAnalyzeArchitecturePayload,
} from "@/modules/project-chat/types";

import { AiMessageStatusIcon } from "./message-icons";

function getRelatedUnits(message: ChatMessageWithDeliveryStatus): ProjectUnitResponse[] {
    const p = message.payload as ToolAnalyzeArchitecturePayload | ProjectUnitResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ProjectUnitResponse[];
    }
    const units = (p as ToolAnalyzeArchitecturePayload)?.related_units;
    return Array.isArray(units) ? (units as ProjectUnitResponse[]) : [];
}

function getAnalyzeArchitectureArgs(message: ChatMessageWithDeliveryStatus): ToolAnalyzeArchitecturePayload["args"] | null {
    const p = message.payload as ToolAnalyzeArchitecturePayload | undefined | null;
    if (!p || Array.isArray(p)) return null;
    return p.args ?? null;
}

function getSummary(message: ChatMessageWithDeliveryStatus): string {
    const p = message.payload as ToolAnalyzeArchitecturePayload | undefined | null;
    if (!p || Array.isArray(p)) return "";
    const s = (p as ToolAnalyzeArchitecturePayload).summary;
    return typeof s === "string" ? s : "";
}

function formatAnalyzeArchitectureArgs(args: ToolAnalyzeArchitecturePayload["args"]): string {
    const parts: string[] = [];
    if (args?.intent != null && args.intent !== "") parts.push(`intent: ${String(args.intent)}`);
    return parts.length ? parts.join(", ") : "—";
}

export function ToolAnalyzeArchitectureMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const units = getRelatedUnits(message);
    const args = getAnalyzeArchitectureArgs(message);
    const summary = getSummary(message);
    const unitCount = units.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasUnits = unitCount > 0;
    const hasSummary = summary.trim().length > 0;
    const hasNestedMessages = nestedMessages != null;

    return (
        <>
            <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                <Collapsible defaultOpen className="group w-full min-w-0 max-w-full overflow-hidden">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CollapsibleTrigger className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className="font-medium text-sm">Analyzing architecture</span>
                                {hasUnits && (
                                    <span className="text-muted-foreground text-xs">
                                        {unitCount} {unitCount === 1 ? "unit" : "units"}
                                    </span>
                                )}
                                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <span className="font-medium">Arguments</span>
                            <span className="block mt-0.5 text-muted-foreground">{args ? formatAnalyzeArchitectureArgs(args) : "—"}</span>
                        </TooltipContent>
                    </Tooltip>
                    <CollapsibleContent
                        className={cn(
                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                            "outline-none min-w-0 max-w-full overflow-hidden",
                        )}
                    >
                        <div className="flex min-w-0 flex-col gap-3 py-2">
                            <div
                                className="min-h-12 rounded-md border border-dashed border-border p-3"
                                aria-label="Thoughts"
                            >
                                {hasNestedMessages ? nestedMessages : <Spinner className="size-3.5 text-muted-foreground" />}
                            </div>
                            {hasUnits && (
                                <div className="min-w-0 w-full max-w-full overflow-hidden">
                                    <FadedScrollArea orientation="horizontal" className="h-14 min-h-0 min-w-0 w-full max-w-full" hideScrollbar>
                                        <div className="flex w-max items-stretch gap-2">
                                            {units.map((unit) => (
                                                <UnitCardChip key={unit.id} unit={unit} />
                                            ))}
                                        </div>
                                    </FadedScrollArea>
                                </div>
                            )}
                            {hasSummary && (
                                <blockquote
                                    className={cn(
                                        "min-w-0 max-w-full border-l-2 border-muted pl-3 text-sm text-muted-foreground",
                                        "[&_p]:my-1 [&_pre]:my-2 [&_pre]:text-xs [&_code]:text-xs",
                                    )}
                                >
                                    <Markdown className="max-w-none">{summary}</Markdown>
                                </blockquote>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </>
    );
}
