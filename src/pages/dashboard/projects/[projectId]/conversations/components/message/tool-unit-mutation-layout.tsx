import type { ReactNode } from "react";

import type { ProjectUnitResponse } from "@/modules/project";
import { UnitCardCompact } from "@/modules/project";
import { ChatMessageStatus, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { AiMessageStatusIcon } from "./message-icons";

export type ToolUnitMutationLayoutProps = {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
    statusLine: string;
    unit: ProjectUnitResponse | null;
};

export function ToolUnitMutationLayout({ message, nestedMessages, statusLine, unit }: ToolUnitMutationLayoutProps) {
    const status = message.status ?? ChatMessageStatus.Generating;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const hasUnit = unit != null;

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                <div className="flex min-w-0 flex-1 flex-col gap-2 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0">
                            <AiMessageStatusIcon status={status} />
                        </span>
                        <p className="min-w-0 text-sm text-muted-foreground">{statusLine}</p>
                    </div>
                    {hasUnit && (
                        <div className="w-fit max-w-full min-w-0 self-start">
                            <UnitCardCompact className="w-auto" unit={unit} />
                        </div>
                    )}
                </div>
            </div>
            {nestedMessages}
        </>
    );
}
