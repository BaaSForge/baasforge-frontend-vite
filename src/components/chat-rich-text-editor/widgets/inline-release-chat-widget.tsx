import { cn } from "@/lib/utils";
import type { ReleaseResponse } from "@/modules/project/types";
import type { NodeKey } from "lexical";
import { releaseComposerEnvironmentLabel } from "../composer-release-display";
import { ComposerInlineWidgetShell } from "./composer-inline-widget-shell";

export type InlineReleaseChatWidgetProps = {
    nodeKey?: NodeKey;
    release: ReleaseResponse;
    className?: string;
};

function ReleasePillContent({ release }: { release: ReleaseResponse }) {
    const env = releaseComposerEnvironmentLabel(release);
    const rev = String(release.revision);
    return (
        <>
            <span className="shrink-0 font-medium text-blue-700 dark:text-blue-300">@release:</span>
            <span className="min-w-0 truncate">
                <span className="font-medium">{env}</span>{" "}
                <span className="tabular-nums text-muted-foreground">{rev}</span>
            </span>
        </>
    );
}

const pillClassName =
    "mx-0.5 inline-flex max-w-[min(100%,18rem)] items-baseline gap-1 rounded-md border border-blue-500/35 bg-blue-500/12 px-1.5 py-0.5 align-baseline text-[0.8125rem] leading-snug text-foreground";

export function InlineReleaseChatWidget({ nodeKey, release, className }: InlineReleaseChatWidgetProps) {
    if (nodeKey != null) {
        return (
            <ComposerInlineWidgetShell
                nodeKey={nodeKey}
                data-inline-release-id={release.id}
                className={cn(pillClassName, className)}
            >
                <ReleasePillContent release={release} />
            </ComposerInlineWidgetShell>
        );
    }
    return (
        <span
            contentEditable={false}
            data-inline-release-id={release.id}
            className={cn(pillClassName, className)}
        >
            <ReleasePillContent release={release} />
        </span>
    );
}
