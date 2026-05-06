"use client";

import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { CodeSnippetActions } from "@/components/syntax-highlight/code-snippet-actions";
import { cn } from "@/lib/utils";

export type UnitExplanationCurrentViewerProps = {
    code: string | null;
    className?: string;
    language?: string;
    plainText?: boolean;
};

export function UnitExplanationCurrentViewer({
    code,
    className,
    language = "typescript",
    plainText = false,
}: UnitExplanationCurrentViewerProps) {
    const text = code?.trim() ?? "";

    return (
        <div
            className={cn(
                "relative min-h-12 w-full min-w-[min(100%,18rem)] rounded-lg border bg-muted/20",
                className,
            )}
        >
            <div className="pointer-events-none absolute right-1 top-1 z-10 sm:right-1.5 sm:top-1.5">
                <div className="pointer-events-auto">
                    <CodeSnippetActions textToCopy={text} />
                </div>
            </div>
            <div className="min-h-0 overflow-x-auto px-2.5 py-2 sm:px-3 sm:py-2.5">
                {plainText ? (
                    <div className="whitespace-pre-wrap break-words pr-10 text-sm leading-relaxed text-foreground">{text || "\u00a0"}</div>
                ) : (
                    <AppSyntaxHighlighter variant="markdownBlock" code={text} language={language} />
                )}
            </div>
        </div>
    );
}
