"use client";

import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import remarkGfm from "remark-gfm";

import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { cn } from "@/lib/utils";

import { markdownComponents } from "./markdown-components";

export type MarkdownTheme = "light" | "dark";

export interface MarkdownProps {
    children: string | null | undefined;
    className?: string;
    theme?: MarkdownTheme;
    components?: Partial<Components>;
}

const remarkPlugins = [remarkGfm];

export function Markdown({ children, className, theme: themeProp, components: componentsOverride }: MarkdownProps) {
    const resolvedTheme = useResolvedTheme();
    const effectiveTheme = themeProp ?? resolvedTheme;
    const codeBlockStyle = effectiveTheme === "dark" ? oneDark : oneLight;

    const fullComponents: Partial<Components> = useMemo(() => {
        const inlineCodeClass =
            themeProp !== undefined ? (effectiveTheme === "dark" ? "bg-white/20 text-gray-100" : "bg-black/10 text-gray-800") : "bg-muted text-foreground";
        return {
            ...markdownComponents,
            code({ className: codeClassName, children: codeChildren, ...props }) {
                const match = /language-(\w+)/.exec(codeClassName ?? "");
                const language = match ? match[1] : "text";
                const isBlock = codeClassName?.startsWith("language-");
                return isBlock ? (
                    <SyntaxHighlighter
                        PreTag="div"
                        style={codeBlockStyle}
                        language={language}
                        customStyle={{
                            margin: 0,
                            borderRadius: "var(--radius, 0.375rem)",
                            fontSize: "0.875rem",
                            minWidth: "100%",
                            width: "max-content",
                        }}
                        codeTagProps={{ style: {} }}
                        showLineNumbers={false}
                    >
                        {String(codeChildren).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                ) : (
                    <code className={cn("relative rounded px-[0.3rem] py-[0.2rem] font-mono font-semibold break-words", inlineCodeClass)} {...props}>
                        {codeChildren}
                    </code>
                );
            },
        };
    }, [codeBlockStyle, effectiveTheme, themeProp]);

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
    return className ? <div className={className}>{content}</div> : content;
}
