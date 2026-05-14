import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardCompact } from "@/modules/project";
import { useChatSessionEmbeddedUnitsLatestRevisions } from "@/modules/project-chat/use-chat-session-embedded-units-latest-revisions";
import { ChatMessageStatus, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";
import { toolUnitMutationStatusLineClassName } from "./tool-header-generating-text";
import { ToolMessagePayloadError } from "./tool-message-payload-error";
import type { UnitSubTask } from "./unit-sub-task-checklist";
import { UnitSubTaskChecklist } from "./unit-sub-task-checklist";

export type ToolUnitMutationLayoutProps = {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
    statusLine: string;
    argsModalTitle: string;
    argsModalContent: ReactNode;
    unit: ProjectUnitResponse | null;
    payloadError?: string | null;
    subTasks?: UnitSubTask[];
};

export function ToolUnitMutationLayout({
    message,
    nestedMessages,
    statusLine,
    argsModalTitle,
    argsModalContent,
    unit,
    payloadError,
    subTasks,
}: ToolUnitMutationLayoutProps) {
    const [argsModalOpen, setArgsModalOpen] = useState(false);
    const { projectId, conversationId: chatSessionId } = useParams<{ projectId: string; conversationId?: string }>();
    const initialUnits = useMemo(() => (unit != null ? [unit] : []), [unit]);
    const shouldRefreshFromHistory = message.status !== ChatMessageStatus.Generating;
    const { units: refreshedUnits, isRefreshing } = useChatSessionEmbeddedUnitsLatestRevisions(
        projectId,
        chatSessionId,
        initialUnits,
        shouldRefreshFromHistory && unit != null,
    );
    const displayUnit = refreshedUnits[0] ?? unit;

    const status = message.status ?? ChatMessageStatus.Generating;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const hasUnit = displayUnit != null;
    const expandDetailsLabel = `View ${argsModalTitle} details`;

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                <div className="flex min-w-0 flex-1 flex-col gap-2 py-2">
                    <div className="flex min-w-0 max-w-full items-center gap-1 self-start">
                        <div className="flex min-w-0 items-center gap-2 text-left">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <p className={cn("min-w-0", toolUnitMutationStatusLineClassName(status))}>{statusLine}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                            aria-label={expandDetailsLabel}
                            onClick={() => setArgsModalOpen(true)}
                        >
                            <Maximize2 className="size-3.5" aria-hidden />
                        </Button>
                    </div>
                    <CentricModal open={argsModalOpen} onOpenChange={setArgsModalOpen}>
                        <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                            <CentricModalHeader>
                                <CentricModalTitle>{argsModalTitle}</CentricModalTitle>
                            </CentricModalHeader>
                            <div className="space-y-4">{argsModalContent}</div>
                        </CentricModalContent>
                    </CentricModal>
                    {subTasks != null && subTasks.length > 0 && (
                        <UnitSubTaskChecklist subTasks={subTasks} />
                    )}
                    {hasUnit && displayUnit != null && (
                        <div className="w-fit max-w-full min-w-0 self-start">
                            <UnitCardCompact
                                className="w-auto"
                                projectId={projectId}
                                chatSessionId={chatSessionId}
                                unit={displayUnit}
                                unitRefreshPending={isRefreshing}
                                showDraftPublishedBadge={false}
                            />
                        </div>
                    )}
                </div>
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
