import { GeneratingTextShimmer } from "@/components/generating-text-shimmer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ContentLoadingStateProps = {
    label?: string;
    className?: string;
};

export function ContentLoadingState({ label = "Loading…", className }: ContentLoadingStateProps) {
    return (
        <div
            className={cn("flex min-w-0 items-center justify-center gap-2.5 py-6", className)}
            role="status"
            aria-label={label}
        >
            <Spinner className="size-5 shrink-0 text-blue-500" aria-hidden />
            <GeneratingTextShimmer className="text-sm">{label}</GeneratingTextShimmer>
        </div>
    );
}
