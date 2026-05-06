import { ChevronDownIcon } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChatMessageStatus } from "@/modules/project-chat/types";

type MessageThinkingProps = {
    thinking: string;
    status?: ChatMessageStatus;
    align: "start" | "end";
};

export function MessageThinking({ thinking, status, align }: MessageThinkingProps) {
    const trimmed = thinking.trim();
    if (!trimmed) return null;

    const isStreaming = status === ChatMessageStatus.Generating;

    return (
        <div
            className={cn(
                "mb-1.5 flex min-w-0 w-full flex-col",
                align === "end" ? "max-w-[80%] items-end" : "max-w-full items-start",
            )}
        >
            <Collapsible
                defaultOpen={isStreaming}
                className={cn(
                    "group flex min-w-0 w-full flex-col",
                    align === "end" ? "items-end" : "items-start",
                )}
            >
                <CollapsibleTrigger
                    className={cn(
                        "inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-md py-1.5 text-left text-muted-foreground outline-none",
                        "transition-[padding,background-color,color] duration-150",
                        "hover:bg-muted/40 hover:text-muted-foreground/90",
                        "pl-0",
                        align === "end"
                            ? "flex-row-reverse pr-2 hover:pl-3"
                            : "pr-3 hover:pl-2",
                    )}
                >
                    <ChevronDownIcon className="size-3.5 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180" />
                    <span className="text-xs font-medium tracking-tight">Thinking</span>
                </CollapsibleTrigger>
                <CollapsibleContent
                    className={cn(
                        "w-full min-w-0",
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1",
                        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1",
                        "border-l-2 border-muted pl-3",
                    )}
                >
                    <Markdown className="max-w-none text-sm text-muted-foreground [&_p]:my-1 [&_pre]:text-xs [&_code]:text-xs">
                        {trimmed}
                    </Markdown>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
