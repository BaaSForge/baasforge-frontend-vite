import { cn } from "@/lib/utils";
import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import { releaseComposerEnvironmentLabel } from "../composer-release-display";

export type InlineTraceChatWidgetProps = {
    trace: ChatComposerTraceReference;
    className?: string;
};

/** Inline pill shown inside the chat composer for a release trace reference. */
export function InlineTraceChatWidget({ trace, className }: InlineTraceChatWidgetProps) {
    const env = releaseComposerEnvironmentLabel(trace.release);
    const rev = String(trace.release.revision);
    const id = trace.traceID.trim();
    return (
        <span
            contentEditable={false}
            data-inline-trace-id={id}
            className={cn(
                "mx-0.5 inline-flex max-w-[min(100%,22rem)] items-baseline gap-1 rounded-md border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 align-baseline text-[0.8125rem] leading-snug text-foreground",
                className,
            )}
        >
            <span className="shrink-0 font-medium text-amber-800 dark:text-amber-200">@trace:</span>
            <span className="min-w-0 truncate">
                <span className="font-medium">{env}</span>{" "}
                <span className="tabular-nums text-muted-foreground">{rev}</span>{" "}
                <span className="font-mono text-[0.75rem] text-muted-foreground">#{id}</span>
            </span>
        </span>
    );
}
