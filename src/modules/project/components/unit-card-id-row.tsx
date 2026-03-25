"use client";

import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export const UNIT_CARD_ID_BADGE_RESERVE_CLASS = "pt-3";

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
                "absolute right-2 top-0 z-1 -translate-y-1/2",
                "inline-flex min-h-[1.375rem] min-w-0 max-w-[calc(100%-1rem)] items-center gap-2 rounded-[4px] border border-border/45 bg-muted px-2 py-0.5",
                "font-mono text-[0.625rem] leading-tight text-muted-foreground",
                "dark:border-border/50",
                className,
            )}
            title="Click to copy ID"
        >
            <span className="min-w-0 flex-1 truncate text-left tracking-tight">{unitId}</span>
            {copiedThis ? (
                <span className="shrink-0 text-[0.5625rem] text-muted-foreground/75">Copied</span>
            ) : null}
        </button>
    );
}
