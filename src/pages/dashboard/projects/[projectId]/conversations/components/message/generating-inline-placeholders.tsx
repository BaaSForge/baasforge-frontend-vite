import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function AiTextGeneratingPlaceholder({ className }: { className?: string }) {
    return (
        <div className={cn("flex w-full min-w-0 items-center gap-2.5", className)} role="status" aria-live="polite">
            <Spinner className="size-4 shrink-0 text-primary" aria-hidden />
            <p className="generating-text-shimmer min-w-0 text-sm font-medium leading-snug">Generating a response</p>
        </div>
    );
}

export function ToolNestedStepsPlaceholder({ className }: { className?: string }) {
    return (
        <div className={cn("flex w-full min-w-0 items-center gap-2.5", className)} role="status" aria-live="polite">
            <Spinner className="size-4 shrink-0 text-primary" aria-hidden />
            <p className="generating-text-shimmer min-w-0 text-sm font-medium leading-snug">Working…</p>
        </div>
    );
}
