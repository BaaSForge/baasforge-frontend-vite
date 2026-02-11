import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageTitleBoxProps {
  title: string;
  tools?: React.ReactNode;
  className?: string;
}

export function PageTitleBox({ title, tools, className }: PageTitleBoxProps) {
  return (
    <div
      className={cn(
        "w-full border-b bg-transparent px-4 py-4 flex flex-row items-center justify-between gap-4",
        className
      )}
    >
      <div className="text-lg font-semibold tracking-tight">{title}</div>
      {tools != null && (
        <div className="flex shrink-0 items-center">{tools}</div>
      )}
    </div>
  );
}
