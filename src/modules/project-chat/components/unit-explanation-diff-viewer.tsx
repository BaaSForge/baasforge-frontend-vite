"use client";

import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerStylesOverride } from "@/components/react-diff-viewer";

export const UNIT_EXPLANATION_DIFF_LEFT_TITLE = "Before (before this chat)" as const;
export const UNIT_EXPLANATION_DIFF_RIGHT_TITLE = "After (this revision)" as const;
export const UNIT_EXPLANATION_DIFF_INLINE_TITLE =
    `${UNIT_EXPLANATION_DIFF_LEFT_TITLE} → ${UNIT_EXPLANATION_DIFF_RIGHT_TITLE}` as const;

function diffViewerVariables(): NonNullable<ReactDiffViewerStylesOverride["variables"]> {
    const palette = {
        diffViewerBackground: "var(--diff-viewer-bg)",
        diffViewerColor: "var(--diff-viewer-fg)",
        diffViewerTitleBackground: "var(--diff-viewer-title-bg)",
        diffViewerTitleColor: "var(--diff-viewer-title-fg)",
        diffViewerTitleBorderColor: "var(--diff-viewer-title-border)",
        addedBackground: "var(--diff-line-added-bg)",
        addedColor: "var(--diff-line-added-fg)",
        removedBackground: "var(--diff-line-removed-bg)",
        removedColor: "var(--diff-line-removed-fg)",
        changedBackground: "var(--diff-line-changed-bg)",
        wordAddedBackground: "var(--diff-word-added-bg)",
        wordRemovedBackground: "var(--diff-word-removed-bg)",
        addedGutterBackground: "var(--diff-gutter-added-bg)",
        removedGutterBackground: "var(--diff-gutter-removed-bg)",
        gutterBackground: "var(--diff-gutter-bg)",
        gutterBackgroundDark: "var(--diff-gutter-bg-dark)",
        gutterColor: "var(--diff-gutter-fg)",
        addedGutterColor: "var(--diff-gutter-added-fg)",
        removedGutterColor: "var(--diff-gutter-removed-fg)",
        highlightBackground: "var(--diff-highlight-line-bg)",
        highlightGutterBackground: "var(--diff-highlight-gutter-bg)",
        emptyLineBackground: "var(--diff-empty-line-bg)",
        codeFoldGutterBackground: "var(--diff-code-fold-gutter-bg)",
        codeFoldBackground: "var(--diff-code-fold-bg)",
        codeFoldContentColor: "var(--diff-code-fold-fg)",
    };
    return { light: palette, dark: palette };
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
        return <AppSyntaxHighlighter variant="diffLine" code={source ?? ""} language="typescript" />;
    }, []);

    const styles = useMemo<ReactDiffViewerStylesOverride>(
        () => ({
            variables: diffViewerVariables(),
            diffContainer: {
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                tableLayout: "fixed",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                overflow: "visible",
            },
            content: {
                fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: "0.8125rem",
                lineHeight: "1.5",
            },
            contentText: {
                whiteSpace: "pre",
            },
        }),
        [],
    );

    return (
        <div
            data-unit-code-diff
            data-scroll-group="unit-code-diff"
            className={cn("min-h-0 w-full min-w-0 overflow-x-auto [&_table]:w-full [&_table]:max-w-none", className)}
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
                leftTitle={UNIT_EXPLANATION_DIFF_LEFT_TITLE}
                rightTitle={UNIT_EXPLANATION_DIFF_RIGHT_TITLE}
                inlineTitle={UNIT_EXPLANATION_DIFF_INLINE_TITLE}
                hideSummary
            />
        </div>
    );
}
