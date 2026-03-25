import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReleaseResponse } from "@/modules/project";
import { ReleaseCardChip } from "@/modules/project";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolFetchLatestReleasesPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";

function getToolFetchLatestReleasesPayload(message: ChatMessageWithDeliveryStatus): ReleaseResponse[] {
    const p = message.payload as ToolFetchLatestReleasesPayload | ReleaseResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ReleaseResponse[];
    }
    const releases = (p as ToolFetchLatestReleasesPayload)?.releases;
    return Array.isArray(releases) ? (releases as ReleaseResponse[]) : [];
}

function getToolFetchLatestReleasesArgs(message: ChatMessageWithDeliveryStatus): ToolFetchLatestReleasesPayload["args"] | null {
    const p = message.payload as ToolFetchLatestReleasesPayload | undefined | null;
    if (!p || Array.isArray(p)) return null;
    return p.args ?? null;
}

function formatLatestReleasesArgs(args: ToolFetchLatestReleasesPayload["args"]): string {
    const parts: string[] = [];
    if (args.limit != null) parts.push(`limit: ${args.limit}`);
    return parts.length ? parts.join(", ") : "—";
}

export function ToolFetchLatestReleasesMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const releases = getToolFetchLatestReleasesPayload(message);
    const args = getToolFetchLatestReleasesArgs(message);
    const releaseCount = releases.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasReleases = releaseCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);

    const headerTooltip = (
        <TooltipContent side="top" className="max-w-xs">
            <span className="font-medium">Arguments</span>
            <span className="block mt-0.5 text-muted-foreground">{args ? formatLatestReleasesArgs(args) : "—"}</span>
        </TooltipContent>
    );

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasReleases ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex max-w-full items-center gap-2 py-3 pr-3 text-left rounded-md">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className="font-medium text-sm">Reading latest releases</span>
                                <span className="text-muted-foreground text-xs">No content</span>
                            </div>
                        </TooltipTrigger>
                        {headerTooltip}
                    </Tooltip>
                ) : (
                    <Collapsible defaultOpen={false} className="group/tool-releases w-full min-w-0 max-w-full overflow-hidden">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CollapsibleTrigger className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className="font-medium text-sm">Reading latest releases</span>
                                    <span className="text-muted-foreground text-xs">
                                        {releaseCount} {releaseCount === 1 ? "release" : "releases"}
                                    </span>
                                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-releases:rotate-180" />
                                </CollapsibleTrigger>
                            </TooltipTrigger>
                            {headerTooltip}
                        </Tooltip>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "outline-none min-w-0 max-w-full overflow-hidden",
                            )}
                        >
                            <div className="min-w-0 w-full max-w-full overflow-hidden py-2">
                                <FadedScrollArea
                                    orientation="horizontal"
                                    horizontalIntrinsicHeight
                                    className="min-h-0 min-w-0 w-full max-w-full"
                                    hideScrollbar
                                >
                                    <div className="flex w-max items-stretch gap-2">
                                        {releases.map((release) => (
                                            <ReleaseCardChip key={release.id} release={release} />
                                        ))}
                                    </div>
                                </FadedScrollArea>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            {nestedMessages}
        </>
    );
}
