import type { ProjectUnitResponse } from "@/modules/project/types";
import type { EditorConfig, LexicalEditor, LexicalUpdateJSON, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import type { JSX } from "react";
import { InlineUnitChatWidget } from "../widgets/inline-unit-chat-widget";

export type SerializedInlineUnitNode = Spread<
    {
        unit: ProjectUnitResponse;
        type: "inline-unit";
        version: 1;
    },
    SerializedLexicalNode
>;

export class InlineUnitNode extends DecoratorNode<JSX.Element> {
    __unit: ProjectUnitResponse;

    static getType(): string {
        return "inline-unit";
    }

    static clone(node: InlineUnitNode): InlineUnitNode {
        return new InlineUnitNode(node.__unit, node.__key);
    }

    static importJSON(serializedNode: SerializedInlineUnitNode): InlineUnitNode {
        return $createInlineUnitNode(serializedNode.unit);
    }

    constructor(unit: ProjectUnitResponse, key?: NodeKey) {
        super(key);
        this.__unit = unit;
    }

    exportJSON(): SerializedInlineUnitNode {
        return {
            type: "inline-unit",
            version: 1,
            unit: this.__unit,
        };
    }

    updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedInlineUnitNode>): this {
        const node = super.updateFromJSON(serializedNode);
        const writable = node.getWritable();
        writable.__unit = serializedNode.unit;
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
        return <InlineUnitChatWidget unit={this.__unit} />;
    }

    getUnit(): ProjectUnitResponse {
        return this.getLatest().__unit;
    }

    getTextContent(): string {
        const u = this.getLatest().__unit;
        return `@unit: ${u.context_slug}.${u.module_slug}.${u.unit_type}.${u.revision}`;
    }

    isInline(): boolean {
        return true;
    }

    isKeyboardSelectable(): boolean {
        return true;
    }
}

export function $createInlineUnitNode(unit: ProjectUnitResponse): InlineUnitNode {
    return new InlineUnitNode(unit);
}

export function $isInlineUnitNode(node: unknown): node is InlineUnitNode {
    return node instanceof InlineUnitNode;
}
