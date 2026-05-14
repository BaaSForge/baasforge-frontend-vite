import type { ReleaseResponse } from "@/modules/project/types";
import type { EditorConfig, LexicalEditor, LexicalUpdateJSON, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import type { JSX } from "react";
import { releaseComposerEnvironmentLabel } from "../composer-release-display";
import { InlineReleaseChatWidget } from "../widgets/inline-release-chat-widget";

export type SerializedInlineReleaseNode = Spread<
    {
        release: ReleaseResponse;
        type: "inline-release";
        version: 1;
    },
    SerializedLexicalNode
>;

export class InlineReleaseNode extends DecoratorNode<JSX.Element> {
    __release: ReleaseResponse;

    static getType(): string {
        return "inline-release";
    }

    static clone(node: InlineReleaseNode): InlineReleaseNode {
        return new InlineReleaseNode(node.__release, node.__key);
    }

    static importJSON(serializedNode: SerializedInlineReleaseNode): InlineReleaseNode {
        return $createInlineReleaseNode(serializedNode.release);
    }

    constructor(release: ReleaseResponse, key?: NodeKey) {
        super(key);
        this.__release = release;
    }

    exportJSON(): SerializedInlineReleaseNode {
        return {
            type: "inline-release",
            version: 1,
            release: this.__release,
        };
    }

    updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedInlineReleaseNode>): this {
        const node = super.updateFromJSON(serializedNode);
        const writable = node.getWritable();
        writable.__release = serializedNode.release;
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
        return <InlineReleaseChatWidget nodeKey={this.getKey()} release={this.__release} />;
    }

    getRelease(): ReleaseResponse {
        return this.getLatest().__release;
    }

    getTextContent(): string {
        const r = this.getLatest().__release;
        return `@release: ${releaseComposerEnvironmentLabel(r)} ${String(r.revision)}`;
    }

    isInline(): boolean {
        return true;
    }

    isKeyboardSelectable(): boolean {
        return true;
    }
}

export function $createInlineReleaseNode(release: ReleaseResponse): InlineReleaseNode {
    return new InlineReleaseNode(release);
}

export function $isInlineReleaseNode(node: unknown): node is InlineReleaseNode {
    return node instanceof InlineReleaseNode;
}
