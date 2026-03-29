import { cn } from "@/lib/utils";

/** Opacity-based highlight so enter and exit both use the same 1s ease (no instant bg snap). */
export function ScrollHighlightOverlay({ show, className }: { show: boolean; className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-in-out",
                show ? "opacity-100" : "opacity-0",
                className,
            )}
        />
    );
}
