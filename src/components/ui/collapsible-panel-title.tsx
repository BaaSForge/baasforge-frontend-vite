"use client";

import { buttonVariants } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

export type CollapsiblePanelTitleProps = ComponentProps<typeof CollapsibleTrigger>;

export function CollapsiblePanelTitle({ className, children, ...props }: CollapsiblePanelTitleProps) {
    return (
        <CollapsibleTrigger
            className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "group w-fit max-w-full justify-start gap-1.5 bg-muted/40 text-left text-xs font-normal text-muted-foreground hover:bg-muted/55 hover:text-foreground/75",
                className,
            )}
            {...props}
        >
            <ChevronDown
                className="size-3.5 shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
            />
            <span className="min-w-0 truncate">{children}</span>
        </CollapsibleTrigger>
    );
}
