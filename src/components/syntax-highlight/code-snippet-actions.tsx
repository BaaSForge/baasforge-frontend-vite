"use client";

import { CopyButton } from "@/components/copy-button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

export type CodeSnippetActionsProps = {
    textToCopy: string;
    className?: string;
    tooltip?: string;
    disabled?: boolean;
};

export function CodeSnippetActions({ textToCopy, className, tooltip, disabled }: CodeSnippetActionsProps) {
    return (
        <ButtonGroup className={cn("gap-0 border-0 bg-transparent p-0 shadow-none", className)}>
            <CopyButton
                textToCopy={textToCopy}
                showLabel={false}
                variant="outline"
                size="icon-xs"
                className="size-7 rounded-md font-semibold text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground"
                disabled={disabled}
                tooltip={tooltip}
                aria-label="Copy code"
            />
        </ButtonGroup>
    );
}
