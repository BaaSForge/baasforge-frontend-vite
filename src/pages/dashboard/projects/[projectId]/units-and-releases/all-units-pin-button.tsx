"use client";

import { ConfirmableButton } from "@/components/ui/confirmable-button";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";

export type AllUnitsPinButtonProps = {
    pinned: boolean;
    onPin: () => void;
    onUnpin: () => void;
    className?: string;
};

export function AllUnitsPinButton({ pinned, onPin, onUnpin, className }: AllUnitsPinButtonProps) {
    return (
        <ConfirmableButton
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
                "text-muted-foreground shrink-0 bg-muted/45 hover:bg-muted/65 dark:bg-muted/35 dark:hover:bg-muted/55",
                pinned && "text-foreground",
                className,
            )}
            aria-label={pinned ? "Unpin unit" : "Pin unit"}
            confirmationTooltip="Re-click to confirm"
            onClick={() => {
                if (pinned) onUnpin();
                else onPin();
            }}
            confirmChildren={<Pin className={cn("size-3 shrink-0", pinned && "fill-current")} aria-hidden />}
        >
            <Pin className={cn("size-3 shrink-0", pinned && "fill-current")} aria-hidden />
        </ConfirmableButton>
    );
}
