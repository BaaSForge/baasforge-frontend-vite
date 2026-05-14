import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
    $createNodeSelection,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    type NodeKey,
} from "lexical";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useEffect } from "react";

export type ComposerInlineWidgetShellProps = {
    nodeKey: NodeKey;
    children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"span">, "children" | "contentEditable">;

export function ComposerInlineWidgetShell({
    nodeKey,
    className,
    children,
    ...rest
}: ComposerInlineWidgetShellProps) {
    const [editor] = useLexicalComposerContext();
    const [isSelected] = useLexicalNodeSelection(nodeKey);

    useEffect(() => {
        return editor.registerCommand(
            CLICK_COMMAND,
            (event: MouseEvent) => {
                const root = editor.getElementByKey(nodeKey);
                const t = event.target;
                if (root == null || !(t instanceof Node)) return false;
                if (!root.contains(t)) return false;
                event.preventDefault();
                const next = $createNodeSelection();
                next.add(nodeKey);
                $setSelection(next);
                return true;
            },
            COMMAND_PRIORITY_CRITICAL,
        );
    }, [editor, nodeKey]);

    return (
        <span
            {...rest}
            role="presentation"
            contentEditable={false}
            className={cn(
                "cursor-pointer select-none outline-none transition-[box-shadow]",
                isSelected && "relative z-[2] ring-2 ring-ring ring-offset-2 ring-offset-background",
                className,
            )}
        >
            {children}
        </span>
    );
}
