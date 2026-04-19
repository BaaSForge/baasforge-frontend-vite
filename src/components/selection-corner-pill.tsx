import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SelectionCornerPill({
    children,
    side = "right",
    className,
}: {
    children: ReactNode;
    side?: "left" | "right";
    className?: string;
}) {
    return (
        <span
            className={cn(
                "pointer-events-none absolute top-0 z-20 -translate-y-1/2 select-none rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow ring-2 ring-background",
                side === "left" ? "left-3" : "right-3",
                className,
            )}
            aria-hidden="true"
        >
            {children}
        </span>
    );
}
