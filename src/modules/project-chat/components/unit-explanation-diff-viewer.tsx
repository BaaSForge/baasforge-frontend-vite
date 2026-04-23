"use client";

import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { cn } from "@/lib/utils";
import type { MutableRefObject, ReactElement, ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerStylesOverride } from "@/components/react-diff-viewer";
import { computeHiddenBlocks, type FoldBlock } from "react-diff-viewer-compute-hidden-blocks";
import {
    computeLineInformation,
    DiffType,
    type DiffInformation,
    type LineInformation,
} from "react-diff-viewer-compute-lines";

export const UNIT_EXPLANATION_DIFF_LEFT_TITLE = "Before (before this chat)" as const;
export const UNIT_EXPLANATION_DIFF_RIGHT_TITLE = "After (this revision)" as const;
export const UNIT_EXPLANATION_DIFF_INLINE_TITLE =
    `${UNIT_EXPLANATION_DIFF_LEFT_TITLE} → ${UNIT_EXPLANATION_DIFF_RIGHT_TITLE}` as const;

const INLINE_LINE_NUMBER_COL_PX = 40;
const INLINE_MARKER_COL_PX = 28;
const INLINE_FOLD_MSG_STICKY_LEFT_PX = INLINE_LINE_NUMBER_COL_PX * 2 + INLINE_MARKER_COL_PX;

const PLAIN_EXPLANATION_DIFF_FONT_SIZE = "1rem";
const PLAIN_EXPLANATION_DIFF_LINE_HEIGHT = "1.625";

const INLINE_DIFF_STICKY_GUTTERS =
    "[&_tbody>tr:not([role=button])>td:nth-child(1)]:sticky [&_tbody>tr:not([role=button])>td:nth-child(1)]:left-0 [&_tbody>tr:not([role=button])>td:nth-child(1)]:z-[1] [&_tbody>tr:not([role=button])>td:nth-child(1)]:shadow-[1px_0_0_0_var(--border)] " +
    "[&_tbody>tr:not([role=button])>td:nth-child(2)]:sticky [&_tbody>tr:not([role=button])>td:nth-child(2)]:left-[40px] [&_tbody>tr:not([role=button])>td:nth-child(2)]:z-[2] [&_tbody>tr:not([role=button])>td:nth-child(2)]:translate-x-[-1px] [&_tbody>tr:not([role=button])>td:nth-child(2)]:shadow-[1px_0_0_0_var(--border)] " +
    "[&_tbody>tr:not([role=button])>td:nth-child(3)]:sticky [&_tbody>tr:not([role=button])>td:nth-child(3)]:left-[80px] [&_tbody>tr:not([role=button])>td:nth-child(3)]:z-[3] [&_tbody>tr:not([role=button])>td:nth-child(3)]:translate-x-[-2px] [&_tbody>tr:not([role=button])>td:nth-child(3)]:shadow-[1px_0_0_0_var(--border)] ";

const INLINE_FOLD_ICON =
    "[&_tbody>tr[role=button]_svg]:h-[15px] [&_tbody>tr[role=button]_svg]:w-[15px]";

const INLINE_FOLD_STICKY =
    "[&_tbody>tr[role=button]>td:nth-child(1)]:sticky [&_tbody>tr[role=button]>td:nth-child(1)]:left-0 [&_tbody>tr[role=button]>td:nth-child(1)]:z-[1] [&_tbody>tr[role=button]>td:nth-child(1)]:self-stretch [&_tbody>tr[role=button]>td:nth-child(1)]:pl-2 [&_tbody>tr[role=button]>td:nth-child(1)]:shadow-[1px_0_0_0_var(--border)] [&_tbody>tr[role=button]>td:nth-child(1)]:bg-[var(--diff-code-fold-bg)] " +
    "[&_tbody>tr[role=button]>td:nth-child(2)]:sticky [&_tbody>tr[role=button]>td:nth-child(2)]:left-[40px] [&_tbody>tr[role=button]>td:nth-child(2)]:z-[2] [&_tbody>tr[role=button]>td:nth-child(2)]:translate-x-[-1px] [&_tbody>tr[role=button]>td:nth-child(2)]:self-stretch [&_tbody>tr[role=button]>td:nth-child(2)]:shadow-[1px_0_0_0_var(--border)] [&_tbody>tr[role=button]>td:nth-child(2)]:bg-[var(--diff-code-fold-bg)] " +
    "[&_tbody>tr[role=button]>td:nth-child(3)]:sticky [&_tbody>tr[role=button]>td:nth-child(3)]:left-[80px] [&_tbody>tr[role=button]>td:nth-child(3)]:z-[3] [&_tbody>tr[role=button]>td:nth-child(3)]:translate-x-[-2px] [&_tbody>tr[role=button]>td:nth-child(3)]:self-stretch [&_tbody>tr[role=button]>td:nth-child(3)]:shadow-[1px_0_0_0_var(--border)] [&_tbody>tr[role=button]>td:nth-child(3)]:bg-[var(--diff-code-fold-bg)]";

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

const DIFF_CONTEXT_LINES = 3;

function DiffFoldExpandIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width={16}
            height={16}
            className={cn("shrink-0 text-[var(--diff-code-fold-fg)]", className)}
            aria-hidden
        >
            <title>expand</title>
            <path
                fill="currentColor"
                d="m8.177.677 2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25a.75.75 0 0 1-1.5 0V4H5.104a.25.25 0 0 1-.177-.427L7.823.677a.25.25 0 0 1 .354 0ZM7.25 10.75a.75.75 0 0 1 1.5 0V12h2.146a.25.25 0 0 1 .177.427l-2.896 2.896a.25.25 0 0 1-.354 0l-2.896-2.896A.25.25 0 0 1 5.104 12H7.25v-1.25Zm-5-2a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 6 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 12 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z"
            />
        </svg>
    );
}

type SplitVisibleRow = { kind: "line"; lineIndex: number } | { kind: "fold"; blockIndex: number; lineIndex: number };

function buildSplitVisibleRows(
    lineInformation: LineInformation[],
    lineBlocks: Record<number, number>,
    blocks: FoldBlock[],
    expandedBlocks: number[],
): SplitVisibleRow[] {
    const out: SplitVisibleRow[] = [];
    const seenFold = new Set<number>();
    for (let i = 0; i < lineInformation.length; i++) {
        const bi = lineBlocks[i];
        if (bi !== undefined && !expandedBlocks.includes(bi)) {
            const b = blocks[bi];
            if (b && b.endLine === i && !seenFold.has(bi)) {
                seenFold.add(bi);
                out.push({ kind: "fold", blockIndex: bi, lineIndex: i });
            }
            continue;
        }
        out.push({ kind: "line", lineIndex: i });
    }
    return out;
}

function SplitFoldRow({
    foldedLines,
    leftLine,
    rightLine,
    onToggle,
    plainText,
}: {
    foldedLines: number;
    leftLine: number;
    rightLine: number;
    onToggle: () => void;
    plainText?: boolean;
}) {
    const msg = `@@ -${leftLine - foldedLines},${foldedLines} +${rightLine - foldedLines},${foldedLines} @@`;
    return (
        <button
            type="button"
            className={cn(
                "group grid w-full cursor-pointer grid-cols-[50px_28px_max-content] border-0 bg-transparent p-0 text-left text-[var(--diff-code-fold-fg)] [contain:paint]",
                plainText
                    ? "font-sans text-base leading-relaxed"
                    : "font-mono text-[0.8125rem] leading-[1.5]",
            )}
            style={{ backgroundColor: "var(--diff-code-fold-bg)" }}
            onClick={onToggle}
        >
            <span
                className="sticky left-0 z-[1] flex items-center justify-center self-stretch px-2.5 py-1 shadow-[1px_0_0_0_var(--border)] transition-colors [contain:paint]"
                style={{ backgroundColor: "var(--diff-code-fold-bg)" }}
            >
                <DiffFoldExpandIcon className="transition-colors group-hover:text-[var(--diff-viewer-fg)]" />
            </span>
            <span
                className="sticky left-[50px] z-[2] flex w-7 shrink-0 translate-x-[-1px] items-center justify-center self-stretch px-2.5 py-1 shadow-[1px_0_0_0_var(--border)] [contain:paint]"
                style={{ backgroundColor: "var(--diff-code-fold-bg)" }}
                aria-hidden
            >
                {"\u00a0"}
            </span>
            <span
                className="sticky left-[78px] z-[4] min-w-0 translate-x-[-2px] self-stretch px-1 py-1 text-left transition-colors [contain:paint]"
                style={{ backgroundColor: "var(--diff-code-fold-bg)" }}
            >
                <span className="block w-max whitespace-pre transition-colors group-hover:text-[var(--diff-viewer-fg)]">
                    {msg}
                </span>
            </span>
        </button>
    );
}

function sideLineBackground(side: DiffInformation): string {
    const t = side.type ?? DiffType.DEFAULT;
    if (t === DiffType.REMOVED) return "var(--diff-line-removed-bg)";
    if (t === DiffType.ADDED) return "var(--diff-line-added-bg)";
    if (t === DiffType.CHANGED) return "var(--diff-line-changed-bg)";
    return "var(--diff-empty-line-bg)";
}

function gutterBackground(side: DiffInformation): string {
    const t = side.type ?? DiffType.DEFAULT;
    if (t === DiffType.REMOVED) return "var(--diff-gutter-removed-bg)";
    if (t === DiffType.ADDED) return "var(--diff-gutter-added-bg)";
    return "var(--diff-gutter-bg)";
}

function markerColumnBackground(side: DiffInformation): string {
    const t = side.type ?? DiffType.DEFAULT;
    if (t === DiffType.REMOVED) return "var(--diff-gutter-removed-bg)";
    if (t === DiffType.ADDED) return "var(--diff-gutter-added-bg)";
    if (t === DiffType.CHANGED) return "var(--diff-line-changed-bg)";
    return "var(--diff-gutter-bg)";
}

function markerChar(side: DiffInformation): string {
    const t = side.type ?? DiffType.DEFAULT;
    if (t === DiffType.ADDED) return "+";
    if (t === DiffType.REMOVED) return "-";
    return " ";
}

function renderDiffFragments(
    value: string | DiffInformation[] | undefined,
    renderContent: (source: string) => ReactElement,
): ReactNode {
    if (value === undefined) return null;
    if (typeof value === "string") {
        return value === "" ? "\u00a0" : renderContent(value);
    }
    return value.map((part, i) => {
        const text = typeof part.value === "string" ? part.value : "";
        const inner = text === "" ? "\u00a0" : renderContent(text);
        const t = part.type ?? DiffType.DEFAULT;
        if (t === DiffType.ADDED) {
            return (
                <ins
                    key={i}
                    className="no-underline"
                    style={{ backgroundColor: "var(--diff-word-added-bg)" }}
                >
                    {inner}
                </ins>
            );
        }
        if (t === DiffType.REMOVED) {
            return (
                <del
                    key={i}
                    className="no-underline"
                    style={{ backgroundColor: "var(--diff-word-removed-bg)" }}
                >
                    {inner}
                </del>
            );
        }
        return <span key={i}>{inner}</span>;
    });
}

function SplitDiffLineRow({
    side,
    renderContent,
    plainText,
}: {
    side: DiffInformation;
    renderContent: (source: string) => ReactElement;
    plainText?: boolean;
}) {
    return (
        <div
            className={cn(
                "grid w-full grid-cols-[50px_28px_max-content] text-[var(--diff-viewer-fg)] [contain:paint]",
                plainText ? "font-sans text-base leading-relaxed" : "font-mono text-[0.8125rem] leading-[1.5]",
            )}
            style={{ backgroundColor: sideLineBackground(side) }}
        >
            <pre
                className="sticky left-0 z-[1] m-0 cursor-default self-stretch border-0 px-2.5 py-0 text-center shadow-[1px_0_0_0_var(--border)] select-none [contain:paint]"
                style={{
                    backgroundColor: gutterBackground(side),
                    color: "var(--diff-gutter-fg)",
                }}
            >
                <span className="opacity-50">{side.lineNumber ?? ""}</span>
            </pre>
            <pre
                className="sticky left-[50px] z-[1] m-0 w-7 shrink-0 self-stretch px-2.5 py-0 text-center shadow-[1px_0_0_0_var(--border)] select-none"
                style={{ backgroundColor: markerColumnBackground(side) }}
            >
                {markerChar(side)}
            </pre>
            <div className="relative z-0 min-w-0 px-1 py-0" style={{ backgroundColor: sideLineBackground(side) }}>
                {renderDiffFragments(side.value, renderContent)}
            </div>
        </div>
    );
}

function syncScrollX(src: HTMLElement, dst: HTMLElement, lock: MutableRefObject<boolean>) {
    if (lock.current) return;
    lock.current = true;
    dst.scrollLeft = src.scrollLeft;
    queueMicrotask(() => {
        lock.current = false;
    });
}

function UnitExplanationSplitDiff({
    lineInformation,
    lineBlocks,
    blocks,
    renderContent,
    leftTitle,
    rightTitle,
    plainText,
}: {
    lineInformation: LineInformation[];
    lineBlocks: Record<number, number>;
    blocks: FoldBlock[];
    renderContent: (source: string) => ReactElement;
    leftTitle: string;
    rightTitle: string;
    plainText?: boolean;
}) {
    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

    const visibleRows = useMemo(
        () => buildSplitVisibleRows(lineInformation, lineBlocks, blocks, expandedBlocks),
        [lineInformation, lineBlocks, blocks, expandedBlocks],
    );

    const toggleBlock = useCallback((blockIndex: number) => {
        setExpandedBlocks((prev) =>
            prev.includes(blockIndex) ? prev.filter((x) => x !== blockIndex) : [...prev, blockIndex],
        );
    }, []);

    const n = visibleRows.length;
    const rows = n ? `repeat(${n}, auto)` : "auto";
    const lockT = useRef(false);
    const lockB = useRef(false);
    const tl = useRef<HTMLDivElement>(null);
    const tr = useRef<HTMLDivElement>(null);
    const bl = useRef<HTMLDivElement>(null);
    const br = useRef<HTMLDivElement>(null);

    return (
        <div className="min-w-0 overflow-hidden rounded-md border border-border bg-[var(--diff-viewer-bg)]">
            <div
                className="relative z-[2] grid min-w-0 border-b border-border"
                style={{
                    backgroundColor: "var(--diff-viewer-title-bg)",
                    gridTemplateColumns: "1fr 1fr",
                }}
            >
                <div
                    ref={tl}
                    className="overflow-x-auto border-r border-border px-2 py-2"
                    onScroll={() => tr.current && tl.current && syncScrollX(tl.current, tr.current, lockT)}
                >
                    <div className="w-max min-w-full">
                        <pre className="m-0 font-mono text-[12px] whitespace-pre text-[var(--diff-viewer-title-fg)]">{leftTitle}</pre>
                    </div>
                </div>
                <div
                    ref={tr}
                    className="overflow-x-auto px-2 py-2"
                    onScroll={() => tl.current && tr.current && syncScrollX(tr.current, tl.current, lockT)}
                >
                    <div className="w-max min-w-full">
                        <pre className="m-0 font-mono text-[12px] whitespace-pre text-[var(--diff-viewer-title-fg)]">{rightTitle}</pre>
                    </div>
                </div>
            </div>
            <div className="relative z-0 grid min-w-0" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: rows }}>
                <div
                    ref={bl}
                    className="min-h-0 min-w-0 overflow-x-auto border-r border-border bg-[var(--diff-viewer-bg)]"
                    style={{
                        display: "grid",
                        gridColumn: 1,
                        gridRow: n ? "1 / -1" : "auto",
                        gridTemplateRows: n ? "subgrid" : "auto",
                    }}
                    onScroll={() => br.current && bl.current && syncScrollX(bl.current, br.current, lockB)}
                >
                    {visibleRows.map((row, i) => {
                        const gridRow = n ? i + 1 : undefined;
                        if (row.kind === "fold") {
                            const line = lineInformation[row.lineIndex];
                            const b = blocks[row.blockIndex];
                            const leftLn = line.left?.lineNumber ?? 0;
                            const rightLn = line.right?.lineNumber ?? 0;
                            return (
                                <div key={`L-f-${row.blockIndex}`} className="w-max min-w-full" style={{ gridRow }}>
                                    <SplitFoldRow
                                        foldedLines={b?.lines ?? 0}
                                        leftLine={leftLn}
                                        rightLine={rightLn}
                                        onToggle={() => toggleBlock(row.blockIndex)}
                                        plainText={plainText}
                                    />
                                </div>
                            );
                        }
                        const line = lineInformation[row.lineIndex];
                        return (
                            <div key={`L-${row.lineIndex}`} className="w-max min-w-full" style={{ gridRow }}>
                                <SplitDiffLineRow
                                    side={line.left ?? {}}
                                    renderContent={renderContent}
                                    plainText={plainText}
                                />
                            </div>
                        );
                    })}
                </div>
                <div
                    ref={br}
                    className="min-h-0 min-w-0 overflow-x-auto bg-[var(--diff-viewer-bg)]"
                    style={{
                        display: "grid",
                        gridColumn: 2,
                        gridRow: n ? "1 / -1" : "auto",
                        gridTemplateRows: n ? "subgrid" : "auto",
                    }}
                    onScroll={() => bl.current && br.current && syncScrollX(br.current, bl.current, lockB)}
                >
                    {visibleRows.map((row, i) => {
                        const gridRow = n ? i + 1 : undefined;
                        if (row.kind === "fold") {
                            const line = lineInformation[row.lineIndex];
                            const b = blocks[row.blockIndex];
                            const leftLn = line.left?.lineNumber ?? 0;
                            const rightLn = line.right?.lineNumber ?? 0;
                            return (
                                <div key={`R-f-${row.blockIndex}`} className="w-max min-w-full" style={{ gridRow }}>
                                    <SplitFoldRow
                                        foldedLines={b?.lines ?? 0}
                                        leftLine={leftLn}
                                        rightLine={rightLn}
                                        onToggle={() => toggleBlock(row.blockIndex)}
                                        plainText={plainText}
                                    />
                                </div>
                            );
                        }
                        const line = lineInformation[row.lineIndex];
                        return (
                            <div key={`R-${row.lineIndex}`} className="w-max min-w-full" style={{ gridRow }}>
                                <SplitDiffLineRow
                                    side={line.right ?? {}}
                                    renderContent={renderContent}
                                    plainText={plainText}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export type UnitExplanationDiffViewerProps = {
    beforeExplanation: string | null;
    afterExplanation: string | null;
    splitView: boolean;
    className?: string;
    syntaxLanguage?: string;
    plainText?: boolean;
};

export function UnitExplanationDiffViewer({
    beforeExplanation,
    afterExplanation,
    splitView,
    className,
    syntaxLanguage = "typescript",
    plainText = false,
}: UnitExplanationDiffViewerProps) {
    const resolved = useResolvedTheme();
    const useDarkTheme = resolved === "dark";

    const oldValue = useMemo(() => explanationToDiffText(beforeExplanation), [beforeExplanation]);
    const newValue = useMemo(() => explanationToDiffText(afterExplanation), [afterExplanation]);

    const renderContent = useCallback(
        (source: string): ReactElement => {
            if (plainText) {
                return (
                    <span
                        className="block font-sans text-base leading-relaxed text-[var(--diff-viewer-fg)]"
                        style={{ whiteSpace: "pre" }}
                    >
                        {source === "" ? "\u00a0" : source}
                    </span>
                );
            }
            return <AppSyntaxHighlighter variant="diffLine" code={source ?? ""} language={syntaxLanguage} />;
        },
        [plainText, syntaxLanguage],
    );

    const splitDiffData = useMemo(() => {
        if (!splitView) return null;
        const { lineInformation, diffLines } = computeLineInformation(oldValue, newValue, false, DiffMethod.LINES);
        const { lineBlocks, blocks } = computeHiddenBlocks(lineInformation, diffLines, DIFF_CONTEXT_LINES);
        return { lineInformation, lineBlocks, blocks };
    }, [splitView, oldValue, newValue]);

    const inlineStyles = useMemo(
        () =>
            ({
                variables: diffViewerVariables(),
                diffContainer: {
                    width: "max-content",
                    minWidth: "100%",
                    tableLayout: "fixed",
                    borderRadius: 0,
                    border: "none",
                    overflow: "visible",
                    "& colgroup > col:nth-of-type(1), & colgroup > col:nth-of-type(2)": {
                        width: `${INLINE_LINE_NUMBER_COL_PX}px`,
                    },
                },
            gutter: {
                minWidth: `${INLINE_LINE_NUMBER_COL_PX}px`,
                width: `${INLINE_LINE_NUMBER_COL_PX}px`,
                padding: "0 4px",
                textAlign: "center",
                verticalAlign: "middle",
                "& pre": {
                    margin: 0,
                    width: "100%",
                    textAlign: "center",
                },
            },
            content: {
                overflow: "visible",
                ...(plainText
                    ? {
                          fontFamily:
                              'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                          fontSize: PLAIN_EXPLANATION_DIFF_FONT_SIZE,
                          lineHeight: PLAIN_EXPLANATION_DIFF_LINE_HEIGHT,
                      }
                    : {
                          fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          fontSize: "0.8125rem",
                          lineHeight: "1.5",
                      }),
            },
            contentText: {
                whiteSpace: "pre",
                lineBreak: "normal",
            },
            marker: {
                boxSizing: "border-box",
                width: "28px",
                minWidth: "28px",
                maxWidth: "28px",
                padding: 0,
                overflow: "hidden",
                textAlign: "center",
                verticalAlign: "middle",
                "& pre": {
                    margin: 0,
                    width: "100%",
                    textAlign: "center",
                },
            },
            codeFoldGutter: {
                verticalAlign: "middle",
                textAlign: "center",
                backgroundColor: "var(--diff-code-fold-bg)",
            },
            codeFold: {
                verticalAlign: "middle",
                backgroundColor: "var(--diff-code-fold-bg)",
                fontSize: "0.75rem",
                lineHeight: 1.45,
                "& > td": {
                    paddingTop: "0.25rem",
                    paddingBottom: "0.25rem",
                },
                "& > td:nth-of-type(3)": {
                    boxSizing: "border-box",
                    width: "28px",
                    minWidth: "28px",
                    maxWidth: "28px",
                    paddingLeft: 0,
                    paddingRight: 0,
                    overflow: "hidden",
                },
            },
            codeFoldContent: {
                fontSize: "0.75rem",
                lineHeight: 1.45,
            },
            codeFoldContentContainer: {
                width: "max-content",
                minWidth: 0,
                maxWidth: "none",
                padding: 0,
                verticalAlign: "middle",
                textAlign: "left",
                whiteSpace: "nowrap",
                backgroundColor: "transparent",
            },
            codeFoldExpandButton: {
                display: "inline-flex",
                position: "sticky",
                left: `${INLINE_FOLD_MSG_STICKY_LEFT_PX}px`,
                zIndex: 5,
                width: "max-content",
                maxWidth: "none",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "0.375rem",
                textAlign: "left",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                lineHeight: 1.45,
                backgroundColor: "var(--diff-code-fold-bg)",
                "& span": {
                    whiteSpace: "nowrap",
                },
            },
            }) as ReactDiffViewerStylesOverride,
        [plainText],
    );

    if (splitView && splitDiffData) {
        return (
            <div data-unit-code-diff data-scroll-group="unit-code-diff" className={cn("min-h-0 w-full min-w-0", className)}>
                <UnitExplanationSplitDiff
                    key={`${oldValue}\0${newValue}`}
                    lineInformation={splitDiffData.lineInformation}
                    lineBlocks={splitDiffData.lineBlocks}
                    blocks={splitDiffData.blocks}
                    renderContent={renderContent}
                    leftTitle={UNIT_EXPLANATION_DIFF_LEFT_TITLE}
                    rightTitle={UNIT_EXPLANATION_DIFF_RIGHT_TITLE}
                    plainText={plainText}
                />
            </div>
        );
    }

    return (
        <div
            data-unit-code-diff
            data-scroll-group="unit-code-diff"
            className={cn("min-h-0 w-full min-w-0 rounded-md border border-border bg-[var(--diff-viewer-bg)]", className)}
        >
            <div
                className="rounded-t-md border-b border-border px-2 py-2"
                style={{ backgroundColor: "var(--diff-viewer-title-bg)" }}
            >
                <pre className="m-0 font-mono text-[12px] whitespace-pre text-[var(--diff-viewer-title-fg)]">
                    {UNIT_EXPLANATION_DIFF_INLINE_TITLE}
                </pre>
            </div>
            <div
                className={cn(
                    "min-h-0 min-w-0 overflow-x-auto rounded-b-md [&_table]:w-max [&_table]:min-w-full",
                    INLINE_DIFF_STICKY_GUTTERS,
                    INLINE_FOLD_STICKY,
                    INLINE_FOLD_ICON,
                )}
            >
                <ReactDiffViewer
                    oldValue={oldValue}
                    newValue={newValue}
                    splitView={false}
                    compareMethod={DiffMethod.LINES}
                    disableWordDiff={false}
                    useDarkTheme={useDarkTheme}
                    styles={inlineStyles}
                    renderContent={renderContent}
                    hideSummary
                />
            </div>
        </div>
    );
}
