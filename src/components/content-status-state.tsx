import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ContentStatusStateProps = {
    title: string;
    description?: string;
    icon: LucideIcon;
    variant?: "empty" | "error";
    className?: string;
};

export function ContentStatusState({ title, description, icon: Icon, variant = "empty", className }: ContentStatusStateProps) {
    const isError = variant === "error";

    return (
        <Empty className={cn("border-border border border-dashed", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon" className={cn(isError && "bg-destructive/10 text-destructive")}>
                    <Icon />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                {description ? <EmptyDescription>{description}</EmptyDescription> : null}
            </EmptyHeader>
        </Empty>
    );
}
