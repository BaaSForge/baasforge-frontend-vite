import { CheckCheck, CheckCircle, Pause, TriangleAlert } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChatMessageDeliveryStatus, ChatMessageStatus } from "@/modules/project-chat/types";

export const MESSAGE_ICON_SIZE = "size-3.5 shrink-0";

export function DeliveryStatusIcon({ status, className }: { status: ChatMessageDeliveryStatus; className?: string }) {
    switch (status) {
        case ChatMessageDeliveryStatus.Delivered:
            return <CheckCheck className={cn(MESSAGE_ICON_SIZE, className)} />;
        case ChatMessageDeliveryStatus.Pending:
            return <Spinner className={cn(MESSAGE_ICON_SIZE, "text-blue-500", className)} aria-label="Sending message" />;
        case ChatMessageDeliveryStatus.Failed:
            return <TriangleAlert className={cn(MESSAGE_ICON_SIZE, "text-destructive", className)} aria-label="Failed to send message" />;
    }
}

export function AiMessageStatusIcon({ status, className }: { status: ChatMessageStatus; className?: string }) {
    switch (status) {
        case ChatMessageStatus.Generating:
            return <Spinner className={cn(MESSAGE_ICON_SIZE, "text-blue-500", className)} aria-label="Generating" />;
        case ChatMessageStatus.Failed:
            return <TriangleAlert className={cn(MESSAGE_ICON_SIZE, "text-destructive", className)} aria-label="Generation has some failures" />;
        case ChatMessageStatus.Stopped:
            return <Pause className={cn(MESSAGE_ICON_SIZE, "text-muted-foreground", className)} aria-label="Stopped" />;
        case ChatMessageStatus.Completed:
            return <CheckCircle className={cn(MESSAGE_ICON_SIZE, "text-muted-foreground", className)} aria-label="Completed" />;
    }
}
