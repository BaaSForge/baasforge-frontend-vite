import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useParams } from "react-router";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Markdown } from "@/components/markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardChip } from "@/modules/project";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolAnalyzeArchitecturePayload,
} from "@/modules/project-chat/types";
import { useChatSessionEmbeddedUnitsLatestRevisions } from "@/modules/project-chat/use-chat-session-embedded-units-latest-revisions";

import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

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

function getDetailedReport(message: ChatMessageWithDeliveryStatus): string {
    const p = message.payload as ToolAnalyzeArchitecturePayload | undefined | null;
    if (!p || Array.isArray(p)) return "";
    const s = (p as ToolAnalyzeArchitecturePayload).detailed_report;
    return typeof s === "string" ? s : "";
}

function formatAnalyzeArchitectureArgs(args: ToolAnalyzeArchitecturePayload["args"]): string {
    const parts: string[] = [];
    if (args?.intent != null && args.intent !== "") parts.push(`intent: ${String(args.intent)}`);
    return parts.length ? parts.join(", ") : "—";
}

export function ToolAnalyzeArchitectureMessage({ message, nestedMessages }: { message: ChatMessageWithDeliveryStatus; nestedMessages?: ReactNode }) {
    const { projectId, conversationId: chatSessionId } = useParams<{ projectId: string; conversationId?: string }>();
    const units = getRelatedUnits(message);
    const shouldRefreshFromHistory = message.status !== ChatMessageStatus.Generating;
    const { units: displayUnits, isRefreshing } = useChatSessionEmbeddedUnitsLatestRevisions(projectId, chatSessionId, units, shouldRefreshFromHistory);
    const args = getAnalyzeArchitectureArgs(message);
    const detailedReport = getDetailedReport(message);
    const unitCount = displayUnits.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasUnits = unitCount > 0;
    const hasDetailedReport = detailedReport.trim().length > 0;
    const hasNestedMessages = nestedMessages != null;
    const payloadError = getToolPayloadErrorString(message.payload);

    return (
        <>
            <div className="w-full min-w-0 max-w-full">
                <div className="flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                    <Collapsible defaultOpen className="group/tool-arch w-full min-w-0 max-w-full overflow-hidden">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CollapsibleTrigger className="inline-flex max-w-full items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className="font-medium text-sm">Analyzing architecture</span>
                                    {hasUnits && (
                                        <span className="text-muted-foreground text-xs">
                                            {unitCount} {unitCount === 1 ? "unit" : "units"}
                                        </span>
                                    )}
                                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-arch:rotate-180" />
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
                                "w-full min-w-0 max-w-full overflow-hidden outline-none",
                            )}
                        >
                            <div className="flex w-full min-w-0 flex-col gap-3 py-2">
                                <div className="min-h-12 w-full min-w-0 rounded-md border border-dashed border-border p-3" aria-label="Thoughts">
                                    {hasNestedMessages ? nestedMessages : <Spinner className="size-3.5 text-muted-foreground" />}
                                </div>
                                {hasUnits && (
                                    <div className="min-w-0 w-full max-w-full overflow-hidden">
                                        <FadedScrollArea
                                            orientation="horizontal"
                                            horizontalIntrinsicHeight
                                            className="min-h-0 min-w-0 w-full max-w-full"
                                            hideScrollbar
                                        >
                                            <div className="flex w-max items-stretch gap-2">
                                                {displayUnits.map((unit) => (
                                                    <UnitCardChip
                                                        key={unit.id}
                                                        projectId={projectId}
                                                        chatSessionId={chatSessionId}
                                                        unit={unit}
                                                        unitRefreshPending={isRefreshing}
                                                    />
                                                ))}
                                            </div>
                                        </FadedScrollArea>
                                    </div>
                                )}
                                {hasDetailedReport && (
                                    <blockquote
                                        className={cn(
                                            "min-w-0 max-w-full border-l-2 border-muted pl-3 text-sm text-muted-foreground",
                                            "[&_p]:my-1 [&_pre]:my-2 [&_pre]:text-xs [&_code]:text-xs",
                                        )}
                                    >
                                        <Markdown className="max-w-none">{detailedReport}</Markdown>
                                    </blockquote>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
        </>
    );
}
