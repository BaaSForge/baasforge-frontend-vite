import { cn } from "@/lib/utils";
import * as React from "react";

export interface SectionTitleProps extends React.ComponentProps<"h2"> {
    children: React.ReactNode;
    className?: string;
}

export function SectionTitle({ children, className, ...props }: SectionTitleProps) {
    return (
        <h2 className={cn("text-sm font-medium text-muted-foreground mb-3", className)} {...props}>
            {children}
        </h2>
    );
}
