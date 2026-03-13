import { CheckCheck, CheckCircle, CircleAlert, StopCircle } from "lucide-react";

import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ChatMessageDeliveryStatus,
  ChatMessageStatus,
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

const MESSAGE_ICON_SIZE = "size-3.5 shrink-0";

function DeliveryStatusIcon({
  status,
  className,
}: {
  status: ChatMessageDeliveryStatus;
  className?: string;
}) {
  switch (status) {
    case ChatMessageDeliveryStatus.Delivered:
      return <CheckCheck className={cn(MESSAGE_ICON_SIZE, className)} />;
    case ChatMessageDeliveryStatus.Pending:
      return (
        <Spinner
          className={cn(MESSAGE_ICON_SIZE, "text-blue-500", className)}
          aria-label="Sending message"
        />
      );
    case ChatMessageDeliveryStatus.Failed:
      return (
        <CircleAlert
          className={cn(MESSAGE_ICON_SIZE, "text-destructive", className)}
          aria-label="Failed to send message"
        />
      );
  }
}

function AiMessageStatusIcon({
  status,
  className,
}: {
  status: ChatMessageStatus;
  className?: string;
}) {
  switch (status) {
    case ChatMessageStatus.Generating:
      return (
        <Spinner
          className={cn(MESSAGE_ICON_SIZE, "text-blue-500", className)}
          aria-label="Generating"
        />
      );
    case ChatMessageStatus.Failed:
      return (
        <CircleAlert
          className={cn(MESSAGE_ICON_SIZE, "text-destructive", className)}
          aria-label="Generation failed"
        />
      );
    case ChatMessageStatus.Stopped:
      return (
        <StopCircle
          className={cn(MESSAGE_ICON_SIZE, "text-muted-foreground", className)}
          aria-label="Stopped"
        />
      );
    case ChatMessageStatus.Completed:
      return (
        <CheckCircle
          className={cn(MESSAGE_ICON_SIZE, "text-muted-foreground", className)}
          aria-label="Completed"
        />
      );
  }
}

export function Message({ message, onRetry }: MessageProps) {
  const resolvedTheme = useResolvedTheme();
  if (message.type !== ChatMessageType.Text) {
    return null;
  }

  const text = typeof message.payload === "string" ? message.payload : "";
  const isUser = message.role === ChatSessionRoleType.User;
  const isFailed = message.delivery_status === ChatMessageDeliveryStatus.Failed;
  const markdownTheme: MarkdownTheme | undefined = isUser
    ? resolvedTheme === "dark"
      ? "light"
      : "dark"
    : undefined;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          isUser ? "items-end max-w-[80%]" : "items-start max-w-full"
        )}
      >
        <div
          className={cn(
            "min-w-0 max-w-full",
            isUser
              ? "rounded-2xl px-4 py-2.5 bg-primary text-primary-foreground rounded-br-md"
              : "",
          )}
        >
          <div className="min-w-0 text-sm">
            <Markdown theme={markdownTheme}>{text}</Markdown>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 h-6",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          {message.role === ChatSessionRoleType.Ai &&
            message.status != null && (
              <AiMessageStatusIcon status={message.status} />
            )}
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
