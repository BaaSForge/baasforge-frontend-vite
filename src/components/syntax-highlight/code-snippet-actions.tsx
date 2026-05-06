"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export type CodeSnippetActionsProps = {
    textToCopy: string;
    className?: string;
    tooltip?: string;
    disabled?: boolean;
};

export function CodeSnippetActions({ textToCopy, className, tooltip, disabled }: CodeSnippetActionsProps) {
    const { copied, copy } = useClipboard();
    const showCheck = Boolean(copied);
    const empty = !textToCopy.trim();
    const mergedDisabled = empty || Boolean(disabled);

    const group = (
        <ButtonGroup className={cn("gap-0 border-0 bg-transparent p-0 shadow-none", className)}>
            <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="size-7 rounded-md font-semibold text-foreground shadow-sm hover:bg-muted/90"
                aria-label="Copy code"
                disabled={mergedDisabled}
                onClick={() => {
                    if (mergedDisabled) return;
                    void copy(textToCopy);
                }}
            >
                {showCheck ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
        </ButtonGroup>
    );

    if (!tooltip) return group;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">{group}</span>
            </TooltipTrigger>
            <TooltipContent side="left">{tooltip}</TooltipContent>
        </Tooltip>
    );
}
