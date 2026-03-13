import type { Components } from "react-markdown";
import { CheckCheck, CheckCircle, CircleAlert, StopCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import remarkGfm from "remark-gfm";

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
import { useResolvedTheme } from "@/components/theme-provider/hooks";

type MessageProps = {
  message: ChatMessageWithDeliveryStatus;
  onRetry?: (message: ChatMessageWithDeliveryStatus) => void;
};

// shadcn typography classes (https://ui.shadcn.com/docs/components/typography)
const typography: Partial<Components> = {
  p: ({ children, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-2 break-words" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-2 ml-6 list-disc [&>li]:mt-1 break-words" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 ml-6 list-decimal [&>li]:mt-1 break-words" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-2 border-l-2 pl-6 italic" {...props}>
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }) => (
    <h1
      className="scroll-m-20 text-lg font-extrabold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="scroll-m-20 pb-1 text-base font-semibold tracking-tight first:mt-0 [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="scroll-m-20 text-base font-semibold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="scroll-m-20 text-sm font-semibold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h4>
  ),
  a: ({ children, ...props }) => (
      <a
        className="font-medium underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    ),
  hr: (props) => <hr className="my-3 border-t border-border" {...props} />,
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ...typography,
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
                    <code
                      className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono font-semibold break-words"
                      {...props}
                    >
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
