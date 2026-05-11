import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import type { ProjectUnitResponse, ReleaseResponse } from "@/modules/project/types";
import type { LexicalEditor, LexicalNode, ParagraphNode } from "lexical";
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $isLineBreakNode,
    $isParagraphNode,
    $isTextNode,
} from "lexical";
import { BAAL_INLINE_TOKEN_RE, base64UrlToUtf8, buildInlineToken } from "./composer-inline-format";
import {
    $createInlineReleaseNode,
    $createInlineTraceNode,
    $createInlineUnitNode,
    $isInlineReleaseNode,
    $isInlineTraceNode,
    $isInlineUnitNode,
} from "./inline-decorator-nodes";

export function exportSerializedComposerText(editor: LexicalEditor): string {
    let result = "";
    editor.getEditorState().read(() => {
        result = $exportSerializedComposerText();
    });
    return result;
}

/** True when `text` contains at least one well-formed `<baal:inline .../>` token (used for paste handling). */
export function plainTextContainsInlineToken(text: string): boolean {
    return new RegExp(BAAL_INLINE_TOKEN_RE.source, "g").test(text);
}

export function replaceComposerFromSerialized(editor: LexicalEditor, serialized: string): void {
    editor.update(
        () => {
            $replaceComposerFromSerialized(serialized);
        },
        { discrete: true },
    );
}

export function $replaceComposerFromSerialized(serialized: string): void {
    const root = $getRoot();
    root.clear();
    const lines = serialized.split("\n");
    if (lines.length === 0) {
        const p = $createParagraphNode();
        p.append($createTextNode(""));
        root.append(p);
        return;
    }
    for (const line of lines) {
        const p = $createParagraphNode();
        p.append(...$parseComposerLineToLexicalNodes(line));
        root.append(p);
    }
}

function $exportSerializedComposerText(): string {
    const root = $getRoot();
    const lines: string[] = [];
    for (const child of root.getChildren()) {
        if ($isParagraphNode(child)) {
            lines.push($serializeParagraphInline(child));
        }
    }
    return lines.join("\n");
}

function $serializeParagraphInline(p: ParagraphNode): string {
    let out = "";
    for (const node of p.getChildren()) {
        if ($isTextNode(node)) {
            out += node.getTextContent();
        } else if ($isLineBreakNode(node)) {
            out += "\n";
        } else if ($isInlineReleaseNode(node)) {
            out += buildInlineToken("release", JSON.stringify(node.getRelease()));
        } else if ($isInlineUnitNode(node)) {
            out += buildInlineToken("unit", JSON.stringify(node.getUnit()));
        } else if ($isInlineTraceNode(node)) {
            out += buildInlineToken("trace", JSON.stringify(node.getTrace()));
        }
    }
    return out;
}

/** One logical line of composer text (no `\n`) into paragraph children, including inline release/unit/trace widgets. */
export function $parseComposerLineToLexicalNodes(line: string): LexicalNode[] {
    const nodes: LexicalNode[] = [];
    const re = new RegExp(BAAL_INLINE_TOKEN_RE.source, "g");
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
        if (m.index > lastIndex) {
            nodes.push($createTextNode(line.slice(lastIndex, m.index)));
        }
        const kind = m[1] as "release" | "unit" | "trace";
        const rawData = m[2];
        try {
            const json = base64UrlToUtf8(rawData);
            const payload: unknown = JSON.parse(json);
            if (kind === "release") {
                nodes.push($createInlineReleaseNode(payload as ReleaseResponse));
            } else if (kind === "unit") {
                nodes.push($createInlineUnitNode(payload as ProjectUnitResponse));
            } else {
                nodes.push($createInlineTraceNode(payload as ChatComposerTraceReference));
            }
        } catch {
            nodes.push($createTextNode(m[0]));
        }
        lastIndex = re.lastIndex;
    }
    if (lastIndex < line.length) {
        nodes.push($createTextNode(line.slice(lastIndex)));
    }
    if (nodes.length === 0) {
        nodes.push($createTextNode(""));
    }
    return nodes;
}
