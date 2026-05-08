"use client";

import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { CodeSnippetActions } from "@/components/syntax-highlight/code-snippet-actions";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { useMemo } from "react";

export interface SpanJsonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    span: unknown | null;
}

function formatSpanJson(span: unknown): string {
    try {
        return JSON.stringify(span, null, 2);
    } catch {
        return String(span);
    }
}

function spanIdLabel(span: unknown): string | null {
    if (span == null || typeof span !== "object" || Array.isArray(span)) return null;
    const id = (span as Record<string, unknown>).spanID;
    return typeof id === "string" && id.trim() !== "" ? id : null;
}

export function SpanJsonModal({ open, onOpenChange, span }: SpanJsonModalProps) {
    const json = useMemo(() => (span == null ? "" : formatSpanJson(span)), [span]);
    const idLine = span == null ? null : spanIdLabel(span);

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Span</CentricModalTitle>
                    {idLine != null ? (
                        <p className="font-mono text-xs text-muted-foreground break-all" title={idLine}>
                            {idLine}
                        </p>
                    ) : null}
                </CentricModalHeader>
                <div className="relative min-h-12 w-full min-w-[min(100%,18rem)] rounded-lg border bg-muted/20">
                    <div className="pointer-events-none absolute right-1 top-1 z-10 sm:right-1.5 sm:top-1.5">
                        <div className="pointer-events-auto">
                            <CodeSnippetActions textToCopy={json || "\u00a0"} />
                        </div>
                    </div>
                    <div className="min-h-0 overflow-x-auto px-2.5 py-2 sm:px-3 sm:py-2.5">
                        {json.length > 0 ? (
                            <AppSyntaxHighlighter variant="markdownBlock" code={json} language="json" />
                        ) : (
                            <div className="pr-10 text-sm text-muted-foreground">&nbsp;</div>
                        )}
                    </div>
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}
