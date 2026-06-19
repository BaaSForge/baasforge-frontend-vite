import { cn } from "@/lib/utils";

type SpotlightContentBoxProps = {
    className?: string;
};

export function SpotlightContentBox({ className }: SpotlightContentBoxProps) {
    return (
        <div
            className={cn(
                "relative z-10 overflow-hidden rounded-xl border border-primary/15 bg-popover text-popover-foreground shadow-2xl shadow-black/20 dark:shadow-black/50",
                className,
            )}
        >
            <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="min-h-12">
                <div id="target-spotlight-overlay-content" />
                <div id="target-spotlight-overlay-actions" />
            </div>
        </div>
    );
}
