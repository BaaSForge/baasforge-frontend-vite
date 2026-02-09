"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface PackageDescriptionProps {
  content: string | null;
  className?: string;
}

export function PackageDescription({ content, className }: PackageDescriptionProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={cn(
        "text-muted-foreground text-sm [&_.prose]:text-inherit",
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-p:my-1.5 prose-p:leading-relaxed",
        "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1",
        "prose-li:marker:text-muted-foreground/70",
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
