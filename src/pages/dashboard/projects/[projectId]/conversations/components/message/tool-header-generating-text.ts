import { cn } from "@/lib/utils";
import { ChatMessageStatus } from "@/modules/project-chat/types";

/** `font-medium text-sm` (default) or `text-sm font-medium` (list-style tool rows). */
export type ToolHeaderTitleClassOrder = "font-medium-sm" | "sm-font-medium";

/**
 * Primary title beside `AiMessageStatusIcon` in tool / finish headers: blue shimmer while generating.
 */
export function toolHeaderPrimaryTitleClassName(
    status: ChatMessageStatus | undefined | null,
    order: ToolHeaderTitleClassOrder = "font-medium-sm",
): string {
    const base = order === "font-medium-sm" ? "font-medium text-sm" : "text-sm font-medium";
    return cn(base, status === ChatMessageStatus.Generating && "generating-text-shimmer-blue");
}

/** Status line in {@link ToolUnitMutationLayout}: muted unless generating. */
export function toolUnitMutationStatusLineClassName(status: ChatMessageStatus | undefined | null): string {
    return cn(
        "min-w-0 text-sm",
        status === ChatMessageStatus.Generating ? "font-medium generating-text-shimmer-blue" : "text-muted-foreground",
    );
}

/** AI “Exploring (n tool calls)” label while streaming. */
export function exploringToolCallsAiLabelClassName(status: ChatMessageStatus | undefined | null): string {
    return cn(
        "min-w-0 text-sm",
        status === ChatMessageStatus.Generating ? "font-medium generating-text-shimmer-blue" : "text-muted-foreground",
    );
}
