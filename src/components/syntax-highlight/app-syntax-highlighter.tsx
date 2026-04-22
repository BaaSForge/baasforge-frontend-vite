"use client";

import { useResolvedAppTheme } from "@/components/theme-provider/hooks";
import { SyntaxHighlighter } from "./react-syntax-highlighter-prism";
import { resolveSyntaxHighlighterStyle } from "./app-syntax-themes";

type MarkdownBlockProps = {
    variant: "markdownBlock";
    code: string;
    language: string;
    markdownTheme?: "light" | "dark";
};

type DiffLineProps = {
    variant: "diffLine";
    code: string;
    language: string;
};

export type AppSyntaxHighlighterProps = MarkdownBlockProps | DiffLineProps;

export function AppSyntaxHighlighter(props: AppSyntaxHighlighterProps) {
    const resolvedApp = useResolvedAppTheme();

    const style = resolveSyntaxHighlighterStyle(
        resolvedApp,
        props.variant === "markdownBlock" ? props.markdownTheme : undefined,
    );

    if (props.variant === "diffLine") {
        return (
            <SyntaxHighlighter
                PreTag="span"
                style={style}
                language={props.language}
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    display: "inline",
                    textShadow: "none",
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                }}
                codeTagProps={{
                    style: {
                        background: "transparent",
                        display: "inline",
                        margin: 0,
                        padding: 0,
                        textShadow: "none",
                        whiteSpace: "pre",
                    },
                }}
                showLineNumbers={false}
            >
                {props.code}
            </SyntaxHighlighter>
        );
    }

    const highlighter = (
        <SyntaxHighlighter
            PreTag="div"
            style={style}
            language={props.language}
            customStyle={{
                margin: 0,
                padding: 0,
                borderRadius: 0,
                fontSize: "0.875rem",
                minWidth: "100%",
                width: "max-content",
                background: "transparent",
            }}
            codeTagProps={{
                style: {
                    background: "transparent",
                    display: "block",
                    margin: 0,
                    padding: 0,
                },
            }}
            showLineNumbers={false}
        >
            {props.code}
        </SyntaxHighlighter>
    );

    return (
        <div className="min-h-0 min-w-0 [&_pre]:m-0 [&_pre]:min-w-0 [&_pre]:box-border [&_pre]:!p-0">
            {highlighter}
        </div>
    );
}
