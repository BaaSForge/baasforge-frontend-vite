import { cn } from "@/lib/utils";
import { useLayoutEffect } from "react";
import { TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID, TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID } from "../constants";
import type { ScrollHint } from "../lib/scroll-hint";
import { notifySpotlightContentHostsMounted } from "../lib/spotlight-content-hosts";
import { ScrollHint as ScrollHintOverlay } from "./scroll-hint";

type SpotlightContentBoxProps = {
    className?: string;
    scrollHint?: ScrollHint | null;
};

export function SpotlightContentBox({ className, scrollHint = null }: SpotlightContentBoxProps) {
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
            <div className="relative min-h-12">
                {scrollHint != null ? <ScrollHintOverlay hint={scrollHint} /> : null}
                <div id={TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID} />
            </div>
            <div id={TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID} />
        </div>
    );
}
