"use client";

import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export type CopyableEntityIdBadgeProps = {
    id: string;
    className?: string;
    title?: string;
};

export function CopyableEntityIdBadge({ id, className, title = "Click to copy ID" }: CopyableEntityIdBadgeProps) {
    const { copied, copy } = useClipboard();
    const copiedThis = copied === id;

    return (
        <button
            type="button"
            onClick={() => void copy(id, id)}
            className={cn(
                "inline-flex min-h-[1.375rem] min-w-0 items-center gap-2 rounded-[4px] border border-border/45 bg-muted px-2 py-0.5",
                "font-mono text-[0.625rem] leading-tight text-muted-foreground",
                "dark:border-border/50",
                className,
            )}
            title={title}
        >
            <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-left tracking-tight [direction:rtl]">
                {id}
            </span>
            {copiedThis ? (
                <span className="shrink-0 text-[0.5625rem] text-muted-foreground/75">Copied</span>
            ) : null}
        </button>
    );
}
