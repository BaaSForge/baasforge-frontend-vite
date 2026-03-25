"use client";

import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export type UnitCardIdRowProps = {
    unitId: string;
    className?: string;
};

export function UnitCardIdRow({ unitId, className }: UnitCardIdRowProps) {
    const { copied, copy } = useClipboard();
    const copiedThis = copied === unitId;

    return (
        <button
            type="button"
            onClick={() => void copy(unitId, unitId)}
            className={cn(
                "flex w-full min-w-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/25 px-2 py-1 text-left font-mono text-[0.625rem] leading-tight text-muted-foreground transition-colors hover:bg-muted/45",
                className,
            )}
            title="Click to copy ID"
        >
            <span className="min-w-0 truncate">{unitId}</span>
            {copiedThis ? (
                <span className="shrink-0 text-[0.5625rem] text-muted-foreground">Copied</span>
            ) : null}
        </button>
    );
}
