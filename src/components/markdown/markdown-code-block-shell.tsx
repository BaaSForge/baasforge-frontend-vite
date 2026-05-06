"use client";

import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useLayoutEffect,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";
import type { Components } from "react-markdown";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { CodeSnippetActions } from "@/components/syntax-highlight/code-snippet-actions";
import { cn } from "@/lib/utils";

const SetMarkdownCodeCopy = createContext<((text: string) => void) | null>(null);

export function MarkdownRegisterCodeCopy({ text }: { text: string }) {
    const set = useContext(SetMarkdownCodeCopy);
    useLayoutEffect(() => {
        set?.(text);
        return () => set?.("");
    }, [text, set]);
    return null;
}

function subtreeHasLanguageClassName(node: ReactNode): boolean {
    for (const c of Children.toArray(node)) {
        if (!isValidElement(c)) continue;
        const { className, children } = c.props as { className?: string; children?: ReactNode };
        if (typeof className === "string" && className.startsWith("language-")) return true;
        if (children != null && subtreeHasLanguageClassName(children)) return true;
    }
    return false;
}

const preInnerClass =
    "m-0 min-w-full w-max max-w-none overflow-visible rounded-md font-mono text-sm leading-relaxed [&>div]:min-w-full [&>div]:w-max";

export function markdownPreWithFader(faderFromClassName: string): NonNullable<Components["pre"]> {
    return function MarkdownPreWithActions({ children, className, ...props }: ComponentProps<"pre">) {
        const fencedWithLanguage = subtreeHasLanguageClassName(children);
        const [copyText, setCopyText] = useState("");
        const register = useCallback((t: string) => setCopyText(t), []);

        const innerPre = (
            <pre className={cn(preInnerClass, className)} {...props}>
                {children}
            </pre>
        );

        if (!fencedWithLanguage) {
            return (
                <FadedScrollArea
                    orientation="horizontal"
                    horizontalIntrinsicHeight
                    className="my-2 min-w-0 max-w-full"
                    faderFromClassName={faderFromClassName}
                >
                    {innerPre}
                </FadedScrollArea>
            );
        }

        return (
            <SetMarkdownCodeCopy.Provider value={register}>
                <div className="relative w-full min-w-0 max-w-full min-h-12 my-2">
                    <div className="pointer-events-none absolute right-1 top-1 z-10 sm:right-1.5 sm:top-1.5">
                        <div className="pointer-events-auto">
                            <CodeSnippetActions textToCopy={copyText} />
                        </div>
                    </div>
                    <FadedScrollArea
                        orientation="horizontal"
                        horizontalIntrinsicHeight
                        className="min-h-0 w-full min-w-0 max-w-full"
                        faderFromClassName={faderFromClassName}
                    >
                        {innerPre}
                    </FadedScrollArea>
                </div>
            </SetMarkdownCodeCopy.Provider>
        );
    };
}
