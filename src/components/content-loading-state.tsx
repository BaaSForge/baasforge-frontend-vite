import type { ContentStatusStateSize } from "@/components/content-status-state";
import { GeneratingTextShimmer } from "@/components/generating-text-shimmer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ContentLoadingStateProps = {
    label?: string;
    size?: ContentStatusStateSize;
    className?: string;
};

export function ContentLoadingState({ label = "Loading…", size = "default", className }: ContentLoadingStateProps) {
    const isCompact = size === "compact";

    return (
        <div
            className={cn(
                "flex min-w-0 items-center justify-center",
                isCompact ? "gap-2 py-2" : "gap-2.5 py-6",
                className,
            )}
            role="status"
            aria-label={label}
        >
            <Spinner className={cn("shrink-0 text-blue-500", isCompact ? "size-4" : "size-5")} aria-hidden />
            <GeneratingTextShimmer className={isCompact ? "text-xs" : "text-sm"}>{label}</GeneratingTextShimmer>
        </div>
    );
}
