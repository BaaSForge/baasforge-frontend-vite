"use client";

import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { cn } from "@/lib/utils";

export type UnitExplanationCurrentViewerProps = {
    code: string | null;
    className?: string;
};

export function UnitExplanationCurrentViewer({ code, className }: UnitExplanationCurrentViewerProps) {
    const text = code?.trim() ?? "";

    return (
        <div
            className={cn(
                "min-h-0 w-full min-w-[min(100%,18rem)] overflow-x-auto rounded-lg border bg-muted/20 px-2.5 py-2 sm:px-3 sm:py-2.5",
                className,
            )}
        >
            <AppSyntaxHighlighter variant="markdownBlock" code={text} language="typescript" />
        </div>
    );
}
