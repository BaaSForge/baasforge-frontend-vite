import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useParams } from "react-router";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardChip } from "@/modules/project";
import { useChatSessionEmbeddedUnitsLatestRevisions } from "@/modules/project-chat/use-chat-session-embedded-units-latest-revisions";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type ToolFetchLatestSpecificProductionReleaseUnitsPayload,
} from "@/modules/project-chat/types";

import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolDetailModalExpandButton, ToolDetailModalLayout } from "./tool-detail-modal-shell";
import {
    nonEmptyStringList,
    ToolFetchLatestSpecificProductionReleaseUnitsArgsModalBody,
    ToolFetchProductionReleaseUnitsArgChips,
} from "./tool-fetch-production-release-units-args-modal-bodies";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const ARGS_MODAL_TITLE = "Latest specific production release units";
const HEADER_TITLE = "Reading latest specific production release units";

function getUnitsPayload(message: ChatMessageWithDeliveryStatus): ProjectUnitResponse[] {
    const p = message.payload as ToolFetchLatestSpecificProductionReleaseUnitsPayload | ProjectUnitResponse[] | undefined | null;
    if (Array.isArray(p)) {
        return p as ProjectUnitResponse[];
    }
    const units = (p as ToolFetchLatestSpecificProductionReleaseUnitsPayload)?.units;
    return Array.isArray(units) ? (units as ProjectUnitResponse[]) : [];
}

function getArgs(
    message: ChatMessageWithDeliveryStatus,
): ToolFetchLatestSpecificProductionReleaseUnitsPayload["args"] | null {
    const p = message.payload as ToolFetchLatestSpecificProductionReleaseUnitsPayload | undefined | null;
    if (!p || Array.isArray(p)) return null;
    return p.args ?? null;
}

export function ToolFetchLatestSpecificProductionReleaseUnitsMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const [argsModalOpen, setArgsModalOpen] = useState(false);
    const { projectId, conversationId: chatSessionId } = useParams<{ projectId: string; conversationId?: string }>();
    const units = getUnitsPayload(message);
    const shouldRefreshFromHistory = message.status !== ChatMessageStatus.Generating;
    const { units: displayUnits, isRefreshing } = useChatSessionEmbeddedUnitsLatestRevisions(
        projectId,
        chatSessionId,
        units,
        shouldRefreshFromHistory,
    );
    const args = getArgs(message);
    const unitPaths = nonEmptyStringList(args?.unit_paths);
    const hasArgChips = unitPaths.length > 0;
    const unitCount = units.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasUnits = unitCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);

    const expandButton = (
        <ToolDetailModalExpandButton
            onClick={() => setArgsModalOpen(true)}
            ariaLabel={`View ${ARGS_MODAL_TITLE} details`}
        />
    );

    const argChips = (
        <ToolFetchProductionReleaseUnitsArgChips ids={unitPaths} copyTitle="Click to copy unit path" />
    );

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasUnits ? (
                    <div className="flex min-w-0 max-w-full flex-col gap-1.5 py-3 pr-3">
                        <div className="flex min-w-0 items-center gap-1">
                            <div className="flex min-w-0 flex-1 items-center gap-2 text-left rounded-md">
                                <span className="shrink-0">
                                    <AiMessageStatusIcon status={status} />
                                </span>
                                <span className={toolHeaderPrimaryTitleClassName(status)}>{HEADER_TITLE}</span>
                                <span className="text-muted-foreground text-xs">No content</span>
                            </div>
                            {expandButton}
                        </div>
                        {hasArgChips && argChips}
                    </div>
                ) : (
                    <Collapsible defaultOpen className="group/tool-units w-full min-w-0 max-w-full overflow-hidden">
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <div className="flex min-w-0 items-center gap-1 pr-3">
                                <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left outline-none rounded-md hover:bg-muted/50 hover:pl-3 transition-all">
                                    <span className="shrink-0">
                                        <AiMessageStatusIcon status={status} />
                                    </span>
                                    <span className={toolHeaderPrimaryTitleClassName(status)}>{HEADER_TITLE}</span>
                                    <span className="text-muted-foreground text-xs">
                                        {unitCount} {unitCount === 1 ? "unit" : "units"}
                                    </span>
                                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-units:rotate-180" />
                                </CollapsibleTrigger>
                                {expandButton}
                            </div>
                            {hasArgChips && argChips}
                        </div>
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
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            <ToolDetailModalLayout open={argsModalOpen} onOpenChange={setArgsModalOpen} title={ARGS_MODAL_TITLE}>
                <ToolFetchLatestSpecificProductionReleaseUnitsArgsModalBody args={args} payloadRaw={message.payload_raw} />
            </ToolDetailModalLayout>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
