import { ChevronDownIcon } from "lucide-react";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ReleaseResponse } from "@/modules/project";
import { ReleaseCardChip } from "@/modules/project";
import {
    ChatMessageStatus,
    type ChatMessageWithDeliveryStatus,
    type ToolFetchLatestReleasesPayload,
} from "@/modules/project-chat/types";

import { AiMessageStatusIcon } from "./message-icons";

function getToolFetchLatestReleasesPayload(message: ChatMessageWithDeliveryStatus): ReleaseResponse[] {
    const p = message.payload as ToolFetchLatestReleasesPayload | ReleaseResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ReleaseResponse[];
    }
    const releases = (p as ToolFetchLatestReleasesPayload)?.releases;
    return Array.isArray(releases) ? (releases as ReleaseResponse[]) : [];
}

export function ToolFetchLatestReleasesMessage({ message }: { message: ChatMessageWithDeliveryStatus }) {
    const releases = getToolFetchLatestReleasesPayload(message);
    const releaseCount = releases.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasReleases = releaseCount > 0;

    return (
        <div className="flex w-0 min-w-full max-w-full justify-start overflow-hidden">
            <Collapsible defaultOpen={false} className="group w-full min-w-0 max-w-full overflow-hidden">
                <CollapsibleTrigger className="flex items-center gap-2 py-3 pr-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                    <span className="shrink-0">
                        <AiMessageStatusIcon status={status} />
                    </span>
                    <span className="font-medium text-sm">Reading latest releases</span>
                    {hasReleases && (
                        <span className="text-muted-foreground text-xs">
                            {releaseCount} {releaseCount === 1 ? "release" : "releases"}
                        </span>
                    )}
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent
                    className={cn(
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                        "outline-none min-w-0 max-w-full overflow-hidden",
                    )}
                >
                    {hasReleases && (
                        <div className="min-w-0 w-full max-w-full overflow-hidden py-2">
                            <FadedScrollArea orientation="horizontal" className="h-14 min-h-0 min-w-0 w-full max-w-full" hideScrollbar>
                                <div className="flex w-max items-stretch gap-2">
                                    {releases.map((release) => (
                                        <ReleaseCardChip key={release.id} release={release} />
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
