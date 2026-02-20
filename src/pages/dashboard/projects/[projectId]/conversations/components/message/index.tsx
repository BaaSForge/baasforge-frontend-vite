import { useEffect, useState } from "react";
import { CheckCheck, CircleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import remarkGfm from "remark-gfm";

import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ChatSessionRoleType,
  type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";
import { Badge } from "@/components/ui/badge";
import { useResolvedTheme } from "@/components/theme-provider/hooks";

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
  const resolvedTheme = useResolvedTheme();
  const codeBlockStyle =
    resolvedTheme === "dark" ? oneDark : oneLight;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "min-w-0 rounded-2xl px-4 py-2.5 max-w-full",
            isUser
              ? cn("bg-primary text-primary-foreground rounded-br-md")
              : "bg-muted rounded-bl-md",
          )}
        >
          <div className="markdown-message min-w-0 whitespace-pre-wrap break-words text-sm [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:rounded [&_code]:break-words [&_ul]:break-words [&_li]:break-words [&_p]:break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className ?? "");
                  const language = match ? match[1] : "text";
                  const isBlock = className?.startsWith("language-");
                  return isBlock ? (
                    <SyntaxHighlighter
                      PreTag="div"
                      style={codeBlockStyle}
                      language={language}
                      customStyle={{
                        margin: 0,
                        borderRadius: "var(--radius, 0.375rem)",
                        fontSize: "0.875rem",
                      }}
                      codeTagProps={{ style: {} }}
                      showLineNumbers={false}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
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
