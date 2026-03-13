import type { Components } from "react-markdown";

const SAFE_LINK_REL = "noopener noreferrer nofollow noindex";

export const markdownComponents: Partial<Components> = {
  p: ({ children, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-2 break-words" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-2 ml-6 list-disc [&>li]:mt-1 break-words" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 ml-6 list-decimal [&>li]:mt-1 break-words" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-2 border-l-2 pl-6 italic" {...props}>
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }) => (
    <h1
      className="scroll-m-20 text-lg font-extrabold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="scroll-m-20 pb-1 text-base font-semibold tracking-tight first:mt-0 [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="scroll-m-20 text-base font-semibold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="scroll-m-20 text-sm font-semibold tracking-tight [&:not(:first-child)]:mt-2"
      {...props}
    >
      {children}
    </h4>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel={SAFE_LINK_REL}
      className="font-medium underline underline-offset-4"
      {...props}
    >
      {children}
    </a>
  ),
  hr: (props) => <hr className="my-3 border-t border-border" {...props} />,
};
