"use client";

import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

export type CollapsiblePanelTitleProps = ComponentProps<typeof CollapsibleTrigger>;

export function CollapsiblePanelTitle({ className, children, ...props }: CollapsiblePanelTitleProps) {
    return (
        <CollapsibleTrigger
            className={cn(
                "group flex min-w-0 flex-1 items-center justify-between gap-2 py-1 text-left text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
            )}
            {...props}
        >
            <span className="min-w-0 truncate">{children}</span>
            <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
            />
        </CollapsibleTrigger>
    );
}
