import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

function blockAsInline(children: ReactNode) {
    return <span className="inline">{children} </span>;
}

const markdownPlainPreviewComponents: Partial<Components> = {
    p: ({ children }) => blockAsInline(children),
    h1: ({ children }) => blockAsInline(children),
    h2: ({ children }) => blockAsInline(children),
    h3: ({ children }) => blockAsInline(children),
    h4: ({ children }) => blockAsInline(children),
    h5: ({ children }) => blockAsInline(children),
    h6: ({ children }) => blockAsInline(children),
    ul: ({ children }) => <span className="inline">{children} </span>,
    ol: ({ children }) => <span className="inline">{children} </span>,
    li: ({ children }) => <span className="inline">{children} </span>,
    blockquote: ({ children }) => blockAsInline(children),
    a: ({ children }) => <span className="inline">{children}</span>,
    strong: ({ children }) => <span className="inline">{children}</span>,
    em: ({ children }) => <span className="inline">{children}</span>,
    del: ({ children }) => <span className="inline">{children}</span>,
    sup: ({ children }) => <span className="inline">{children}</span>,
    sub: ({ children }) => <span className="inline">{children}</span>,
    code: ({ children }) => <span className="inline">{children}</span>,
    pre: ({ children }) => blockAsInline(children),
    hr: () => " ",
    br: () => " ",
    img: ({ alt }) => <span className="inline">{alt ?? ""}</span>,
    table: ({ children }) => blockAsInline(children),
    thead: ({ children }) => <span className="inline">{children}</span>,
    tbody: ({ children }) => <span className="inline">{children}</span>,
    tfoot: ({ children }) => <span className="inline">{children}</span>,
    tr: ({ children }) => <span className="inline">{children} </span>,
    th: ({ children }) => <span className="inline">{children} </span>,
    td: ({ children }) => <span className="inline">{children} </span>,
    /** GFM task list checkbox — omit glyph; list text remains in `li`. */
    input: () => null,
};

export type MarkdownPlainPreviewProps = {
    source: string;
    className?: string;
};

export function MarkdownPlainPreview({ source, className }: MarkdownPlainPreviewProps) {
    return (
        <p className={className}>
            <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownPlainPreviewComponents}>
                {source}
            </ReactMarkdown>
        </p>
    );
}
