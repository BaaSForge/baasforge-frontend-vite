"use client";

import { Markdown, type MarkdownTheme } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { Components } from "react-markdown";

import { parseSerializedTextIntoSegments } from "./parse-serialized-inline-segments";
import { InlineReleaseChatWidget } from "./widgets/inline-release-chat-widget";
import { InlineTraceChatWidget } from "./widgets/inline-trace-chat-widget";
import { InlineUnitChatWidget } from "./widgets/inline-unit-chat-widget";

/** Keeps markdown paragraphs flowing in one line beside inline composer widgets. */
const segmentsMarkdownComponents: Partial<Components> = {
    p: ({ children }) => <span className="inline leading-relaxed">{children}</span>,
};

export type ChatSerializedMessageBodyProps = {
    serialized: string;
    className?: string;
    markdownTheme?: MarkdownTheme;
    embeddedOnInverse?: boolean;
};

/** Renders persisted composer text: markdown plus the same inline pills as the rich-text composer. */
export function ChatSerializedMessageBody({
    serialized,
    className,
    markdownTheme,
    embeddedOnInverse,
}: ChatSerializedMessageBodyProps) {
    const segments = useMemo(() => parseSerializedTextIntoSegments(serialized), [serialized]);
    const hasInlines = segments.some((s) => s.type !== "text");

    if (!hasInlines) {
        return (
            <div className={cn("text-start", className)}>
                <Markdown theme={markdownTheme} embeddedOnInverse={embeddedOnInverse}>
                    {serialized}
                </Markdown>
            </div>
        );
    }

    return (
        <div
            dir="auto"
            className={cn("flex min-w-0 flex-wrap items-baseline gap-x-0.5 gap-y-1 text-start", className)}
        >
            {segments.map((seg, i) => {
                if (seg.type === "text") {
                    if (seg.text === "") return null;
                    return (
                        <Markdown
                            key={i}
                            theme={markdownTheme}
                            embeddedOnInverse={embeddedOnInverse}
                            components={segmentsMarkdownComponents}
                        >
                            {seg.text}
                        </Markdown>
                    );
                }
                if (seg.type === "release") {
                    return <InlineReleaseChatWidget key={i} release={seg.release} />;
                }
                if (seg.type === "unit") {
                    return <InlineUnitChatWidget key={i} unit={seg.unit} />;
                }
                if (seg.type === "trace") {
                    return <InlineTraceChatWidget key={i} trace={seg.trace} />;
                }
                return (
                    <span key={i} className="min-w-0 break-all font-mono text-xs">
                        {seg.token}
                    </span>
                );
            })}
        </div>
    );
}
