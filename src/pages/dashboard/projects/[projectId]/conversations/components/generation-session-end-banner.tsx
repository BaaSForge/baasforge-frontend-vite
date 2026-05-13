import { Pause, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

import { MESSAGE_ICON_SIZE } from "./message/message-icons";

export type GenerationSessionEndBannerVariant = "failed" | "stopped";

export function GenerationSessionEndBanner({ variant }: { variant: GenerationSessionEndBannerVariant }) {
    const isFailed = variant === "failed";
    return (
        <div className="mt-4 mb-6 flex w-full min-w-0 items-center gap-3">
            <div className="h-px min-w-0 flex-1 bg-border" aria-hidden />
            <div
                className={cn(
                    "flex shrink-0 items-center gap-2",
                    isFailed ? "text-destructive" : "text-muted-foreground",
                )}
            >
                {isFailed ? (
                    <TriangleAlert className={MESSAGE_ICON_SIZE} aria-hidden />
                ) : (
                    <Pause className={MESSAGE_ICON_SIZE} aria-hidden />
                )}
                <p className="text-xs">{isFailed ? "Generation has some failures." : "Generation stopped."}</p>
            </div>
            <div className="h-px min-w-0 flex-1 bg-border" aria-hidden />
        </div>
    );
}
