import { cn } from "@/lib/utils";
import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import type { NodeKey } from "lexical";
import { releaseComposerEnvironmentLabel } from "../composer-release-display";
import { ComposerInlineWidgetShell } from "./composer-inline-widget-shell";

export type InlineTraceChatWidgetProps = {
    nodeKey?: NodeKey;
    trace: ChatComposerTraceReference;
    className?: string;
};

function TracePillContent({ trace }: { trace: ChatComposerTraceReference }) {
    const env = releaseComposerEnvironmentLabel(trace.release);
    const rev = String(trace.release.revision);
    const id = trace.traceID.trim();
    return (
        <>
            <span className="shrink-0 font-medium text-amber-800 dark:text-amber-200">@trace:</span>
            <span className="min-w-0 truncate">
                <span className="font-medium">{env}</span>{" "}
                <span className="tabular-nums text-muted-foreground">{rev}</span>{" "}
                <span className="font-mono text-[0.75rem] text-muted-foreground">#{id}</span>
            </span>
        </>
    );
}

const pillClassName =
    "mx-0.5 inline-flex max-w-[min(100%,22rem)] items-baseline gap-1 rounded-md border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 align-baseline text-[0.8125rem] leading-snug text-foreground";

export function InlineTraceChatWidget({ nodeKey, trace, className }: InlineTraceChatWidgetProps) {
    const id = trace.traceID.trim();
    if (nodeKey != null) {
        return (
            <ComposerInlineWidgetShell
                nodeKey={nodeKey}
                data-inline-trace-id={id}
                className={cn(pillClassName, className)}
            >
                <TracePillContent trace={trace} />
            </ComposerInlineWidgetShell>
        );
    }
    return (
        <span contentEditable={false} data-inline-trace-id={id} className={cn(pillClassName, className)}>
            <TracePillContent trace={trace} />
        </span>
    );
}
