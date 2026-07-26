"use client";

import { Check, Copy } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export type CopyButtonProps = Omit<ButtonProps, "onClick" | "children" | "type"> & {
    textToCopy: string;
    copyId?: string;
    label?: string;
    copiedLabel?: string;
    showLabel?: boolean;
    tooltip?: string;
    disableWhenEmpty?: boolean;
    onCopied?: (text: string) => void;
};

export function CopyButton({
    textToCopy,
    copyId,
    label = "Copy",
    copiedLabel = "Copied",
    showLabel = true,
    tooltip,
    disableWhenEmpty = true,
    onCopied,
    className,
    disabled,
    size = "xs",
    variant = "ghost",
    "aria-label": ariaLabel = "Copy",
    ...rest
}: CopyButtonProps) {
    const { copied, copy } = useClipboard();
    const isCopied = copyId != null ? copied === copyId : Boolean(copied);
    const empty = !textToCopy.trim();
    const mergedDisabled = disabled || (disableWhenEmpty && empty);

    const button = (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={cn(
                showLabel && "h-6 shrink-0 gap-1 px-2 text-xs font-medium",
                className,
            )}
            disabled={mergedDisabled}
            aria-label={showLabel ? undefined : isCopied ? copiedLabel : ariaLabel}
            onClick={() => {
                if (mergedDisabled) return;
                void copy(textToCopy, copyId).then((result) => {
                    if (result.success) onCopied?.(textToCopy);
                });
            }}
            {...rest}
        >
            {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {showLabel ? (isCopied ? copiedLabel : label) : null}
        </Button>
    );

    if (!tooltip) return button;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">{button}</span>
            </TooltipTrigger>
            <TooltipContent side="left">{tooltip}</TooltipContent>
        </Tooltip>
    );
}
