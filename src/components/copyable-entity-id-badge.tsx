"use client";

import type { ReactNode } from "react";

import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export type CopyableEntityIdBadgeProps = {
    id: string;
    className?: string;
    title?: string;
    /** Shown inside the chip before the id; clipboard still receives only {@link id}. */
    label?: string;
    /** Renders before {@link label} (e.g. lucide icon with `className="size-3"`). */
    leadingIcon?: ReactNode;
    /** When false, the chip grows with the id (still capped by max-w on the button via className). */
    truncate?: boolean;
    /** Optional callback triggered after copy. */
    onCopy?: (id: string) => void;
    /** Optional element ID for tutorial targeting. */
    tutorialTargetId?: string;
};

export function CopyableEntityIdBadge({
    id,
    className,
    title = "Click to copy ID",
    label,
    leadingIcon,
    truncate = true,
    onCopy,
    tutorialTargetId,
}: CopyableEntityIdBadgeProps) {
    const { copied, copy } = useClipboard();
    const copyStateKey = label != null && label !== "" ? `${label}:${id}` : id;
    const copiedThis = copied === copyStateKey;

    const handleClick = () => {
        void copy(id, copyStateKey);
        onCopy?.(id);
    };

    return (
        <button
            id={tutorialTargetId}
            type="button"
            onClick={handleClick}
            className={cn(
                "inline-flex min-h-[1.375rem] min-w-0 items-center gap-x-2 rounded-[4px] border border-border/45 bg-muted px-2 py-0.5",
                "text-[0.625rem] leading-none text-muted-foreground",
                "dark:border-border/50",
                truncate ? "max-w-full" : "w-fit max-w-full overflow-x-auto",
                className,
            )}
            title={title}
        >
            {leadingIcon != null ? (
                <span className="inline-flex shrink-0 items-center text-muted-foreground [&>svg]:size-3 [&>svg]:shrink-0">
                    {leadingIcon}
                </span>
            ) : null}
            {label != null && label !== "" ? (
                <span className="shrink-0 font-mono font-medium tracking-wide text-muted-foreground/85">{label}</span>
            ) : null}
            <span
                className={cn(
                    "min-w-0 font-mono tracking-tight",
                    truncate
                        ? "flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-left [direction:rtl]"
                        : "shrink-0 whitespace-nowrap text-left",
                )}
            >
                {id}
            </span>
            {copiedThis ? (
                <span className="shrink-0 font-mono text-muted-foreground/75">Copied</span>
            ) : null}
        </button>
    );
}
