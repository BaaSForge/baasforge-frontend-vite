import { cn } from "@/lib/utils";
import * as React from "react";

export interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
    return <h2 className={cn("text-sm font-medium text-muted-foreground mb-3 px-1", className)}>{children}</h2>;
}
