import { cn } from "@/lib/utils";
import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    MOVE_TO_END,
    MOVE_TO_START,
    PASTE_COMMAND,
    LineBreakNode,
    ParagraphNode,
    TextNode,
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $isParagraphNode,
    $isRangeSelection,
    $normalizeSelection__EXPERIMENTAL,
    mergeRegister,
    type LexicalEditor,
    type LexicalNode,
    type RangeSelection,
} from "lexical";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    type JSX,
    type MutableRefObject,
} from "react";
import {
    $parseComposerLineToLexicalNodes,
    exportSerializedComposerText,
    plainTextContainsInlineToken,
    replaceComposerFromSerialized,
} from "./composer-serialization";
import {
    $createInlineReleaseNode,
    $createInlineTraceNode,
    $createInlineUnitNode,
    InlineReleaseNode,
    InlineTraceNode,
    InlineUnitNode,
} from "./inline-decorator-nodes";

const COMPOSER_NAMESPACE = "baal-chat-composer";

export type ChatRichTextEditorHandle = {
    focus: () => void;
    blur: () => void;
    /** Appends plain text at the end of the last block (used by global keyboard fallback). */
    appendPlainText: (text: string) => void;
    insertRelease: (release: ReleaseResponse) => void;
    insertUnit: (unit: ProjectUnitResponse) => void;
    insertTrace: (trace: ChatComposerTraceReference) => void;
};

export type ChatRichTextEditorProps = {
    /** Change when the owning conversation/session identity changes so Lexical remounts cleanly. */
    resetKey?: string;
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    contentClassName?: string;
    disabled?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    /** Enter without Shift — typically submit when allowed. */
    onSubmitRequest?: () => void;
    onEscapeRequest?: () => void;
    /** Fires when the user types `@` (for future mention menus). */
    onAtGlyph?: () => void;
    /** Fires when the user types `/` (for future slash-command menus). */
    onSlashGlyph?: () => void;
};

function $appendPlainTextAtEnd(text: string): void {
    const root = $getRoot();
    const last = root.getLastChild();
    let paragraph: ParagraphNode;
    if ($isParagraphNode(last)) {
        paragraph = last;
    } else {
        paragraph = $createParagraphNode();
        root.append(paragraph);
    }
    paragraph.selectEnd();
    const sel = $getSelection();
    if ($isRangeSelection(sel)) {
        sel.insertText(text);
    }
}

function focusComposerAtEnd(editor: LexicalEditor): void {
    editor.update(() => {
        $getRoot().selectEnd();
    });
    editor.focus();
}

function $insertInlineAtEnd(nodes: LexicalNode[]): void {
    const root = $getRoot();
    const last = root.getLastChild();
    let paragraph: ParagraphNode;
    if ($isParagraphNode(last)) {
        paragraph = last;
    } else {
        paragraph = $createParagraphNode();
        root.append(paragraph);
    }
    paragraph.append(...nodes);
    paragraph.selectEnd();
}

function HistoryPlugin(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        const historyState = createEmptyHistoryState();
        return registerHistory(editor, historyState, 300);
    }, [editor]);
    return null;
}

function $extendComposerSelectionToDocumentEnd(sel: RangeSelection): void {
    const root = $getRoot();
    const lastTop = root.getLastChild();
    if (lastTop == null || !$isParagraphNode(lastTop)) return;
    const key = lastTop.getKey();
    const offset = lastTop.getChildrenSize();
    if (sel.isBackward()) {
        sel.anchor.set(key, offset, "element");
    } else {
        sel.focus.set(key, offset, "element");
    }
    sel.dirty = true;
    $normalizeSelection__EXPERIMENTAL(sel);
}

function LineBoundaryMetaArrowsPlugin(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                KEY_DOWN_COMMAND,
                (event: KeyboardEvent) => {
                    if (event.altKey) return false;
                    if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return false;
                    const toDocEnd = event.key === "End" || event.code === "End";
                    const toLineEnd = event.key === "ArrowRight" || event.code === "ArrowRight";
                    if (!toDocEnd && !toLineEnd) return false;
                    const sel = $getSelection();
                    if (!$isRangeSelection(sel)) return false;
                    event.preventDefault();
                    if (toDocEnd) {
                        $extendComposerSelectionToDocumentEnd(sel);
                    } else {
                        sel.modify("extend", false, "lineboundary");
                    }
                    return true;
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand(
                MOVE_TO_END,
                (event: KeyboardEvent) => {
                    const sel = $getSelection();
                    if (!$isRangeSelection(sel)) return false;
                    event.preventDefault();
                    sel.modify("move", false, "lineboundary");
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                MOVE_TO_START,
                (event: KeyboardEvent) => {
                    const sel = $getSelection();
                    if (!$isRangeSelection(sel)) return false;
                    event.preventDefault();
                    sel.modify("move", true, "lineboundary");
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);
    return null;
}

function ComposerCommandsPlugin({
    onSubmitRequest,
    onEscapeRequest,
    onAtGlyph,
    onSlashGlyph,
}: Pick<ChatRichTextEditorProps, "onSubmitRequest" | "onEscapeRequest" | "onAtGlyph" | "onSlashGlyph">): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event) => {
                if (event != null && !event.shiftKey) {
                    event.preventDefault();
                    onSubmitRequest?.();
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH,
        );
    }, [editor, onSubmitRequest]);

    useEffect(() => {
        return editor.registerCommand(
            KEY_ESCAPE_COMMAND,
            () => {
                editor.blur();
                onEscapeRequest?.();
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor, onEscapeRequest]);

    useEffect(() => {
        return editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                if (event.key === "@") {
                    onAtGlyph?.();
                } else if (event.key === "/") {
                    onSlashGlyph?.();
                }
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor, onAtGlyph, onSlashGlyph]);

    return null;
}

/** Plain-text paste from history / copy does not run `replaceComposerFromSerialized`; parse `<baal:inline …/>` here. */
function ComposerPasteInlineTokensPlugin(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const text = event.clipboardData?.getData("text/plain") ?? "";
                if (!text || !plainTextContainsInlineToken(text)) return false;
                event.preventDefault();
                editor.update(() => {
                    const sel = $getSelection();
                    if (!$isRangeSelection(sel)) return;
                    const lines = text.split("\n");
                    const nodes: LexicalNode[] = [];
                    for (let i = 0; i < lines.length; i++) {
                        if (i > 0) nodes.push($createLineBreakNode());
                        nodes.push(...$parseComposerLineToLexicalNodes(lines[i] ?? ""));
                    }
                    sel.insertNodes(nodes);
                });
                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );
    }, [editor]);
    return null;
}

function EditableSyncPlugin({ disabled }: { disabled: boolean }): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.setEditable(!disabled);
    }, [editor, disabled]);
    return null;
}

function EditorRefPlugin({ editorRef }: { editorRef: MutableRefObject<LexicalEditor | null> }): null {
    const [editor] = useLexicalComposerContext();
    useLayoutEffect(() => {
        editorRef.current = editor;
        return () => {
            editorRef.current = null;
        };
    }, [editor, editorRef]);
    return null;
}

function ControlledValuePlugin({ value, onChange }: Pick<ChatRichTextEditorProps, "value" | "onChange">): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const lastEmittedRef = useRef<string | null>(null);
    const readyRef = useRef(false);

    useLayoutEffect(() => {
        readyRef.current = false;
        replaceComposerFromSerialized(editor, value);
        lastEmittedRef.current = value;
        readyRef.current = true;
        /* Follow-up `value` updates are synced in the effect below (typing keeps value === lastEmittedRef). */
    }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps -- Lexical editor mounts once; `value` is first-render snapshot

    useLayoutEffect(() => {
        if (!readyRef.current) return;
        if (value !== lastEmittedRef.current) {
            readyRef.current = false;
            replaceComposerFromSerialized(editor, value);
            lastEmittedRef.current = value;
            readyRef.current = true;
        }
    }, [editor, value]);

    return (
        <OnChangePlugin
            onChange={(editorState, ed) => {
                if (!readyRef.current) return;
                editorState.read(() => {
                    const serialized = exportSerializedComposerText(ed);
                    lastEmittedRef.current = serialized;
                    onChange(serialized);
                });
            }}
        />
    );
}

export const ChatRichTextEditor = forwardRef<ChatRichTextEditorHandle, ChatRichTextEditorProps>(
    function ChatRichTextEditor(
        {
            resetKey,
            id,
            value,
            onChange,
            placeholder,
            className,
            contentClassName,
            disabled = false,
            onFocus,
            onBlur,
            onSubmitRequest,
            onEscapeRequest,
            onAtGlyph,
            onSlashGlyph,
        },
        ref,
    ) {
        const editorRef = useRef<LexicalEditor | null>(null);

        const initialConfig = useMemo(
            () => ({
                namespace: COMPOSER_NAMESPACE,
                theme: {
                    paragraph: "composer-lexical-paragraph m-0 min-h-[1.25rem]",
                },
                onError: (e: Error) => {
                    console.error(e);
                },
                nodes: [ParagraphNode, TextNode, LineBreakNode, InlineReleaseNode, InlineUnitNode, InlineTraceNode],
                editorState: () => {
                    const root = $getRoot();
                    root.clear();
                    const p = $createParagraphNode();
                    p.append($createTextNode(""));
                    root.append(p);
                },
            }),
            [],
        );

        useImperativeHandle(
            ref,
            () => ({
                focus: () => {
                    const editor = editorRef.current;
                    if (editor) focusComposerAtEnd(editor);
                },
                blur: () => editorRef.current?.blur(),
                appendPlainText: (text: string) => {
                    editorRef.current?.update(() => {
                        $appendPlainTextAtEnd(text);
                    });
                },
                insertRelease: (release: ReleaseResponse) => {
                    editorRef.current?.update(() => {
                        $insertInlineAtEnd([$createInlineReleaseNode(release)]);
                    });
                },
                insertUnit: (unit: ProjectUnitResponse) => {
                    editorRef.current?.update(() => {
                        $insertInlineAtEnd([$createInlineUnitNode(unit)]);
                    });
                },
                insertTrace: (trace: ChatComposerTraceReference) => {
                    editorRef.current?.update(() => {
                        $insertInlineAtEnd([$createInlineTraceNode(trace)]);
                    });
                },
            }),
            [],
        );

        return (
            <div className={cn("relative min-h-10 max-h-40 w-full overflow-y-auto text-sm", className)}>
                <LexicalComposer key={resetKey ?? COMPOSER_NAMESPACE} initialConfig={initialConfig}>
                    <EditorRefPlugin editorRef={editorRef} />
                    <EditableSyncPlugin disabled={disabled} />
                    <HistoryPlugin />
                    <ComposerCommandsPlugin
                        onSubmitRequest={onSubmitRequest}
                        onEscapeRequest={onEscapeRequest}
                        onAtGlyph={onAtGlyph}
                        onSlashGlyph={onSlashGlyph}
                    />
                    <LineBoundaryMetaArrowsPlugin />
                    <ComposerPasteInlineTokensPlugin />
                    <ControlledValuePlugin value={value} onChange={onChange} />
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                id={id}
                                spellCheck
                                data-slot="input-group-control"
                                placeholder={null}
                                className={cn(
                                    "relative z-[1] min-h-10 max-h-40 w-full resize-none bg-transparent px-3 py-3 outline-none",
                                    contentClassName,
                                )}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        }
                        placeholder={(editable) =>
                            editable && placeholder ? (
                                <div className="pointer-events-none absolute top-3 left-3 z-0 max-w-[calc(100%-1.5rem)] text-muted-foreground select-none">
                                    {placeholder}
                                </div>
                            ) : null
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </LexicalComposer>
            </div>
        );
    },
);
