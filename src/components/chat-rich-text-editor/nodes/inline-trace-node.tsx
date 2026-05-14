import type { ChatComposerTraceReference } from "@/modules/project-chat/types";
import type { EditorConfig, LexicalEditor, LexicalUpdateJSON, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import type { JSX } from "react";
import { releaseComposerEnvironmentLabel } from "../composer-release-display";
import { InlineTraceChatWidget } from "../widgets/inline-trace-chat-widget";

export type SerializedInlineTraceNode = Spread<
    {
        trace: ChatComposerTraceReference;
        type: "inline-trace";
        version: 1;
    },
    SerializedLexicalNode
>;

export class InlineTraceNode extends DecoratorNode<JSX.Element> {
    __trace: ChatComposerTraceReference;

    static getType(): string {
        return "inline-trace";
    }

    static clone(node: InlineTraceNode): InlineTraceNode {
        return new InlineTraceNode(node.__trace, node.__key);
    }

    static importJSON(serializedNode: SerializedInlineTraceNode): InlineTraceNode {
        return $createInlineTraceNode(serializedNode.trace);
    }

    constructor(trace: ChatComposerTraceReference, key?: NodeKey) {
        super(key);
        this.__trace = trace;
    }

    exportJSON(): SerializedInlineTraceNode {
        return {
            type: "inline-trace",
            version: 1,
            trace: this.__trace,
        };
    }

    updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedInlineTraceNode>): this {
        const node = super.updateFromJSON(serializedNode);
        const writable = node.getWritable();
        writable.__trace = serializedNode.trace;
        return writable;
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        void config;
        void editor;
        const span = document.createElement("span");
        span.className = "inline-decorator-anchor";
        return span;
    }

    updateDOM(prevNode: unknown, dom: HTMLElement, config: EditorConfig): boolean {
        void prevNode;
        void dom;
        void config;
        return false;
    }

    decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
        void editor;
        void config;
        return <InlineTraceChatWidget nodeKey={this.getKey()} trace={this.__trace} />;
    }

    getTrace(): ChatComposerTraceReference {
        return this.getLatest().__trace;
    }

    getTextContent(): string {
        const t = this.getLatest().__trace;
        const env = releaseComposerEnvironmentLabel(t.release);
        return `@trace: ${env} ${String(t.release.revision)} #${t.traceID}`;
    }

    isInline(): boolean {
        return true;
    }

    isKeyboardSelectable(): boolean {
        return true;
    }
}

export function $createInlineTraceNode(trace: ChatComposerTraceReference): InlineTraceNode {
    return new InlineTraceNode(trace);
}

export function $isInlineTraceNode(node: unknown): node is InlineTraceNode {
    return node instanceof InlineTraceNode;
}
