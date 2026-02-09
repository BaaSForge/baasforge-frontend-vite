import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PageTitleBoxProps {
  title: string;
  tools?: React.ReactNode;
  className?: string;
}

export function PageTitleBox({ title, tools, className }: PageTitleBoxProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          {title}
        </CardTitle>
        {tools != null && (
          <div className="flex shrink-0 items-center">{tools}</div>
        )}
      </CardHeader>
    </Card>
  );
}
