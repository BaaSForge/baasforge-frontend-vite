"use client";

import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerStylesOverride } from "@/components/react-diff-viewer";

function shadcnDiffThemeVariables(): NonNullable<ReactDiffViewerStylesOverride["variables"]> {
    const shared = {
        diffViewerBackground: "var(--background)",
        diffViewerColor: "var(--foreground)",
        diffViewerTitleBackground: "var(--muted)",
        diffViewerTitleColor: "var(--foreground)",
        diffViewerTitleBorderColor: "var(--border)",
        addedBackground: "color-mix(in oklch, oklch(0.72 0.14 155) 14%, var(--background))",
        addedColor: "var(--foreground)",
        removedBackground: "color-mix(in oklch, oklch(0.65 0.2 25) 12%, var(--background))",
        removedColor: "var(--foreground)",
        changedBackground: "color-mix(in oklch, oklch(0.85 0.12 85) 18%, var(--background))",
        wordAddedBackground: "color-mix(in oklch, oklch(0.65 0.14 155) 28%, var(--background))",
        wordRemovedBackground: "color-mix(in oklch, oklch(0.62 0.18 25) 26%, var(--background))",
        addedGutterBackground: "color-mix(in oklch, oklch(0.78 0.12 155) 20%, var(--muted))",
        removedGutterBackground: "color-mix(in oklch, oklch(0.72 0.16 25) 18%, var(--muted))",
        gutterBackground: "var(--muted)",
        gutterBackgroundDark: "color-mix(in oklch, var(--muted) 90%, var(--foreground))",
        highlightBackground: "color-mix(in oklch, oklch(0.88 0.1 85) 22%, var(--background))",
        highlightGutterBackground: "color-mix(in oklch, var(--muted) 85%, var(--foreground))",
        codeFoldGutterBackground: "var(--muted)",
        codeFoldBackground: "color-mix(in oklch, var(--muted) 96%, var(--foreground))",
        emptyLineBackground: "color-mix(in oklch, var(--background) 97%, var(--foreground))",
        gutterColor: "var(--muted-foreground)",
        addedGutterColor: "var(--foreground)",
        removedGutterColor: "var(--foreground)",
        codeFoldContentColor: "var(--muted-foreground)",
    };
    return { light: shared, dark: shared };
}

function explanationToDiffText(value: string | null | undefined): string {
    return value?.trim() ?? "";
}

export type UnitExplanationDiffViewerProps = {
    beforeExplanation: string | null;
    afterExplanation: string | null;
    splitView: boolean;
    className?: string;
};

export function UnitExplanationDiffViewer({
    beforeExplanation,
    afterExplanation,
    splitView,
    className,
}: UnitExplanationDiffViewerProps) {
    const resolved = useResolvedTheme();
    const useDarkTheme = resolved === "dark";

    const oldValue = useMemo(() => explanationToDiffText(beforeExplanation), [beforeExplanation]);
    const newValue = useMemo(() => explanationToDiffText(afterExplanation), [afterExplanation]);

    const renderContent = useCallback((source: string): ReactElement => {
        const text = source ?? "";
        return <AppSyntaxHighlighter variant="diffLine" code={text} language="typescript" />;
    }, []);

    const styles = useMemo<ReactDiffViewerStylesOverride>(
        () => ({
            variables: shadcnDiffThemeVariables(),
            diffContainer: {
                width: "100%",
                minWidth: "100%",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                overflow: "hidden",
            },
            content: {
                fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: "0.8125rem",
                lineHeight: "1.5",
            },
        }),
        [],
    );

    return (
        <div
            className={cn(
                "min-h-0 w-full min-w-[min(100%,18rem)] overflow-x-auto [&_table]:w-full",
                className,
            )}
        >
            <ReactDiffViewer
                oldValue={oldValue}
                newValue={newValue}
                splitView={splitView}
                compareMethod={DiffMethod.LINES}
                disableWordDiff={false}
                useDarkTheme={useDarkTheme}
                styles={styles}
                renderContent={renderContent}
                leftTitle="Before (before this chat)"
                rightTitle="After (this revision)"
                inlineTitle="Before (before this chat) → After (this revision)"
                hideSummary
            />
        </div>
    );
}
