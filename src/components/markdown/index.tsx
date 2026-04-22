"use client";

import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { useResolvedAppTheme, useResolvedTheme } from "@/components/theme-provider/hooks";
import { cn } from "@/lib/utils";

import { markdownComponents, markdownPreWithFader, markdownTableWithFader } from "./markdown-components";

export type MarkdownTheme = "light" | "dark";

export interface MarkdownProps {
    children: string | null | undefined;
    className?: string;
    theme?: MarkdownTheme;
    embeddedOnInverse?: boolean;
    components?: Partial<Components>;
}

const remarkPlugins = [remarkGfm];

export function Markdown({ children, className, theme: themeProp, embeddedOnInverse, components: componentsOverride }: MarkdownProps) {
    const resolvedTheme = useResolvedTheme();
    const resolvedAppTheme = useResolvedAppTheme();
    const effectiveTheme = themeProp ?? resolvedTheme;

    const fullComponents: Partial<Components> = useMemo(() => {
        const inverted = themeProp !== undefined;
        const inlineCodeClass =
            inverted && embeddedOnInverse
                ? effectiveTheme === "dark"
                    ? "bg-inverse-foreground/12 text-inverse-foreground/95"
                    : "bg-inverse-foreground/10 text-inverse-foreground/92"
                : inverted
                  ? effectiveTheme === "dark"
                      ? "bg-white/20 text-gray-100"
                      : "bg-black/10 text-gray-800"
                  : "bg-muted text-foreground";
        return {
            ...markdownComponents,
            ...(embeddedOnInverse
                ? {
                      pre: markdownPreWithFader("from-inverse"),
                      table: markdownTableWithFader("from-inverse"),
                  }
                : {}),
            code({ className: codeClassName, children: codeChildren, ...props }) {
                const match = /language-(\w+)/.exec(codeClassName ?? "");
                const language = match ? match[1] : "text";
                const isBlock = codeClassName?.startsWith("language-");
                return isBlock ? (
                    <div
                        className={cn(
                            "overflow-x-auto rounded-md p-2 sm:p-3",
                            themeProp != null && embeddedOnInverse && resolvedAppTheme === "dark-midnight"
                                ? "bg-secondary"
                                : "bg-muted",
                        )}
                    >
                        <AppSyntaxHighlighter
                            variant="markdownBlock"
                            code={String(codeChildren).replace(/\n$/, "")}
                            language={language}
                            markdownTheme={themeProp != null && embeddedOnInverse ? undefined : themeProp}
                        />
                    </div>
                ) : (
                    <code className={cn("relative rounded px-[0.3rem] py-[0.2rem] font-mono font-semibold break-words", inlineCodeClass)} {...props}>
                        {codeChildren}
                    </code>
                );
            },
        };
    }, [effectiveTheme, themeProp, embeddedOnInverse, resolvedAppTheme]);

    const mergedComponents = useMemo(
        () => (componentsOverride ? { ...fullComponents, ...componentsOverride } : fullComponents),
        [fullComponents, componentsOverride],
    );

    const source = children ?? "";
    const content = (
        <ReactMarkdown remarkPlugins={remarkPlugins} components={mergedComponents}>
            {source}
        </ReactMarkdown>
    );
    const embeddedToneClass =
        embeddedOnInverse && themeProp !== undefined
            ? "[&_blockquote]:border-inverse-foreground/25 [&_hr]:border-inverse-foreground/20 [&_tr]:border-inverse-foreground/20 [&_th]:text-inverse-foreground/95 [&_td]:text-inverse-foreground/90"
            : undefined;
    const needsWrapper = Boolean(className || embeddedToneClass);
    const wrapperClass = cn(embeddedToneClass, className);
    return needsWrapper ? <div className={wrapperClass}>{content}</div> : content;
}

export { MarkdownPlainPreview, type MarkdownPlainPreviewProps } from "./markdown-plain-preview";
