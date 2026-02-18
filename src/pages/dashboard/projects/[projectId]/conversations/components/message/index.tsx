import { CheckCheck, CircleAlert } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ChatSessionRoleType,
  type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";
import { Badge } from "@/components/ui/badge";

type MessageProps = {
  message: ChatMessageWithDeliveryStatus;
  onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

function formatMessageTime(dateValue: string): string {
  return new Date(dateValue).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DeliveryStatusIcon({
  status,
  className,
}: {
  status: ChatMessageDeliveryStatus;
  className?: string;
}) {
  switch (status) {
    case ChatMessageDeliveryStatus.Delivered:
      return <CheckCheck className={cn("size-3.5 shrink-0", className)} />;
    case ChatMessageDeliveryStatus.Pending:
      return (
        <Spinner
          className={cn("size-3.5 shrink-0 text-blue-500", className)}
          aria-label="Sending message"
        />
      );
    case ChatMessageDeliveryStatus.Failed:
      return (
        <CircleAlert
          className={cn("size-3.5 shrink-0 text-destructive", className)}
          aria-label="Failed to send message"
        />
      );
  }
}

export function Message({ message, onRetry }: MessageProps) {
  if (message.type !== ChatMessageType.Text) {
    return null;
  }

  const text = typeof message.payload === "string" ? message.payload : "";
  const isUser = message.role === ChatSessionRoleType.User;
  const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            isUser
              ? cn("bg-primary text-primary-foreground rounded-br-md")
              : "bg-muted rounded-bl-md",
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{text}</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 h-6",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[0.625rem] text-muted-foreground">
            {formatMessageTime(message.created_at)}
          </span>
          {message.role === ChatSessionRoleType.User && (
            <DeliveryStatusIcon status={message.delivery_status} />
          )}
          {isFailed && (
            <Badge
              variant="destructive"
              className="cursor-pointer text-[0.625rem]"
              onClick={() => onRetry?.(message)}
            >
              Retry
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
