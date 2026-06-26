import { cn } from "@/lib/utils";
import { useLayoutEffect } from "react";
import { TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID, TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID } from "../constants";
import { notifySpotlightContentHostsMounted } from "../lib/spotlight-content-hosts";

type SpotlightContentBoxProps = {
    className?: string;
};

export function SpotlightContentBox({ className }: SpotlightContentBoxProps) {
    useLayoutEffect(() => {
        notifySpotlightContentHostsMounted();
    });

    return (
        <div
            className={cn(
                "relative z-10 overflow-hidden rounded-xl border border-primary/15 bg-popover text-popover-foreground shadow-2xl shadow-black/20 dark:shadow-black/50",
                className,
            )}
        >
            <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="min-h-12">
                <div id={TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID} />
                <div id={TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID} />
            </div>
        </div>
    );
}
