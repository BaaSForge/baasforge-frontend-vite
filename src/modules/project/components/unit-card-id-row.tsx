"use client";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { cn } from "@/lib/utils";

export const UNIT_CARD_ID_BADGE_RESERVE_CLASS = "pt-3";

export type UnitCardIdRowProps = {
    unitId: string;
    className?: string;
    variant?: "card" | "inline";
    onCopy?: (unitId: string) => void;
    tutorialTargetId?: string;
};

export function UnitCardIdRow({ unitId, className, variant = "card", onCopy, tutorialTargetId }: UnitCardIdRowProps) {
    return (
        <CopyableEntityIdBadge
            id={unitId}
            className={cn(
                variant === "card" &&
                    "absolute right-2 top-0 z-1 -translate-y-1/2 max-w-[calc(100%-1rem)]",
                variant === "inline" && "relative max-w-full min-w-0 self-start justify-start",
                className,
            )}
            onCopy={onCopy}
            tutorialTargetId={tutorialTargetId}
        />
    );
}
