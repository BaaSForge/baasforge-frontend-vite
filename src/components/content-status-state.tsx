import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ContentStatusStateSize = "default" | "compact";

type ContentStatusStateProps = {
    title: string;
    description?: string;
    icon: LucideIcon;
    variant?: "empty" | "error";
    size?: ContentStatusStateSize;
    className?: string;
};

export function ContentStatusState({
    title,
    description,
    icon: Icon,
    variant = "empty",
    size = "default",
    className,
}: ContentStatusStateProps) {
    const isError = variant === "error";
    const isCompact = size === "compact";

    return (
        <Empty
            className={cn(
                "border-border border border-dashed",
                isCompact && "gap-2 p-3 md:p-3",
                className,
            )}
        >
            <EmptyHeader className={isCompact ? "gap-1" : undefined}>
                <EmptyMedia
                    variant="icon"
                    className={cn(
                        isError && "bg-destructive/10 text-destructive",
                        isCompact && "mb-0 size-6 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
                    )}
                >
                    <Icon />
                </EmptyMedia>
                <EmptyTitle className={isCompact ? "text-sm font-medium leading-snug" : undefined}>{title}</EmptyTitle>
                {description ? (
                    <EmptyDescription className={isCompact ? "text-xs leading-snug" : undefined}>{description}</EmptyDescription>
                ) : null}
            </EmptyHeader>
        </Empty>
    );
}
